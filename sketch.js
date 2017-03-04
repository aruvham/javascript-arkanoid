// Arkanoid by arturham
// 9 Dic 2016

//-------------------------------------------------------------------------
// game constants
//-------------------------------------------------------------------------

var w    = 546,    // canvas width
    h    = 434,    // canvas height
    cols = 11,
    rows = 30,
    cw   = 336,    // court width
    ch   = 420,    // court height
    wall = 14,     // walls width
    pt   = 14,     // padding top
    pr   = 168,    // padding right
    pl   = 42,     // padding left
    pw   = 56,     // paddle width
    ph   = 14,     // paddle height
    bw   = 28,     // brick width
    bh   = 14,     // brick height
    br   = 5,      // ball radius

    KEY  = { A: 65, D: 68, Q: 81, R: 82, S: 83, W: 87 },

    maxSpeed = 10; // pixels per frame



//-------------------------------------------------------------------------
// game variables
//-------------------------------------------------------------------------

var game,       // game obj
    paddle,     // paddle obj
    balls,      // array for balls
    bricks,     // array for bricks
    powerUps,   // array for p ups
    lasers,     // array for lasers
    highScore,
    score,
    lives,
    level,
    frameCounter;

//-------------------------------------------------------------------------
// game states
//-------------------------------------------------------------------------

var menu,
    paused,
    stopped;

//-------------------------------------------------------------------------
// preload
//-------------------------------------------------------------------------

function preload() {
  // fonts
  F_Retro = loadFont("assets/F_Retro.ttf");

  // sprites
  SP_Background = loadImage("assets/SP_Background.png");
  SP_Ball       = loadImage("assets/SP_Ball.png");
  SP_Brick_01   = loadImage("assets/SP_Brick_01.png");
  SP_Brick_02   = loadImage("assets/SP_Brick_02.png");
  SP_Brick_03   = loadImage("assets/SP_Brick_03.png");
  SP_Brick_04   = loadImage("assets/SP_Brick_04.png");
  SP_Brick_05   = loadImage("assets/SP_Brick_05.png");
  SP_Brick_06   = loadImage("assets/SP_Brick_06.png");
  SP_Brick_07   = loadImage("assets/SP_Brick_07.png");
  SP_Brick_08   = loadImage("assets/SP_Brick_08.png");
  SP_Brick_09   = loadImage("assets/SP_Brick_09.png");
  SP_Laser      = loadImage("assets/SP_Laser.png");
  SP_Paddle_01  = loadImage("assets/SP_Paddle_01.png");
  SP_Paddle_02  = loadImage("assets/SP_Paddle_02.png");
  SP_Paddle_03  = loadImage("assets/SP_Paddle_03.png");
  SP_Power_01   = loadImage("assets/SP_Power_01.png");
  SP_Power_02   = loadImage("assets/SP_Power_02.png");
  SP_Power_03   = loadImage("assets/SP_Power_03.png");
  SP_Power_04   = loadImage("assets/SP_Power_04.png");
  SP_Power_05   = loadImage("assets/SP_Power_05.png");
  SP_Power_06   = loadImage("assets/SP_Power_06.png");

  // sounds
  S_Destroy     = loadSound("assets/S_Destroy.wav");
  S_Expand      = loadSound("assets/S_Expand.wav");
  S_Expand.playMode("restart");
  S_Extra       = loadSound("assets/S_Extra.wav");
  S_Extra.playMode("restart");
  S_Explosion_01= loadSound("assets/S_Explosion_01.wav");
  S_Explosion_01.playMode("restart");
  S_Hit_01      = loadSound("assets/S_Hit_01.wav");
  S_Hit_01.playMode("restart"); // paddle
  S_Hit_02      = loadSound("assets/S_Hit_02.wav");
  S_Hit_02.playMode("restart"); // brick
  S_Hit_03      = loadSound("assets/S_Hit_03.wav");
  S_Hit_03.playMode("restart"); // metal
  S_Hit_04      = loadSound("assets/S_Hit_04.wav");
  S_Hit_04.playMode("restart"); // magnet
  S_Laser       = loadSound("assets/S_Laser.wav");
  S_Start_01    = loadSound("assets/S_Start_01.wav"); // init
  S_Start_02    = loadSound("assets/S_Start_02.wav"); // loadLevel
}

//-------------------------------------------------------------------------
// setup
//-------------------------------------------------------------------------

function setup() {
  createCanvas(w, h);
  game = new Game();
  highScore = 25000;
  game.init();
}

//-------------------------------------------------------------------------
// draw
//-------------------------------------------------------------------------

function draw() {
  game.update();
  game.show();
}

//-------------------------------------------------------------------------
// events
//-------------------------------------------------------------------------

function keyPressed() {
  if(!menu) {
    if(keyCode == ENTER) paused = !paused;
    if(keyCode == KEY.W && !paused) {
      debugger;
      balls.forEach(function(b){
        if(!b.moving) b.launch();
      });
    }
    if(keyCode == KEY.S && !paused) paddle.shoot();
    if(paused && keyCode == KEY.Q) game.init();
  }
  if(menu) {
    if(keyCode == KEY.R) game.changeLevel();
    if(keyCode == ENTER) game.startGame();
  }
  return false; // prevent default behavior
}

//-------------------------------------------------------------------------
// Game
//-------------------------------------------------------------------------

function Game() {
  this.init = function() {
    S_Start_01.play();
    paddle       = new Paddle();
    balls        = [ new Ball() ],
    bricks       = [],
    powerUps     = [],
    lasers       = [],
    score        = 0,
    lives        = 3,
    level        = 1,
    frameCounter = 0,

    menu    = true;
    paused  = false,
    stopped = false;
  }

  this.update = function() {
    if(!stopped && !paused && !menu) {
      paddle.update();
      // balls
      for(var i = balls.length - 1; i > -1; i--) {
        balls[i].update();
        if(balls[i].destroyed()) {
          balls.splice(i, 1);
          if(balls.length == 0) {
            lives--;
            powerUps = [];
            paddle = new Paddle();
            if(lives > 0) {
              S_Destroy.play();
              balls.push(new Ball());
              paddle = new Paddle();
              this.showMessage("\n\n\nPLAYER READY", 90, "f");
            } else {
              game.gameOver();
            }
          }
        }
      } // balls

      // powerUps
      for(var i = powerUps.length - 1; i > -1; i--) {
        powerUps[i].update();
        if(powerUps[i].hitPaddle()) {
          powerUps.splice(i, 1);
        }
      } // powerUps

      // lasers
      for(var i = lasers.length - 1; i > -1; i--) {
        lasers[i].update();
        if(lasers[i].destroyed()) {
          lasers.splice(i, 1);
          break;
        }
        for(var j = bricks.length - 1; j > -1; j--) {
          if(lasers[i].hitBrick(bricks[j])) {
            S_Explosion_01.play();
            lasers.splice(i, 1);
            bricks[j].hp--;
            if(bricks[j].hp == 0) {
              this.updateScore(bricks[j]);
              bricks.splice(j, 1);
            }
            break;
          }
        }
      } // lasers

      if(!menu) if(this.isBricksEmpty()) this.nextLevel();
      }
      frameCounter++;
      if(frameCounter == 0) {
        stopped = false;
      }
  } // update

  this.show = function() {
    if(!stopped) {
        background(0);
        this.drawCourt();
        this.showGameInfo();
      if(!menu) {
        paddle.show();
           balls.forEach(function(b){ b.show(); });
          bricks.forEach(function(b){ b.show(); });
        powerUps.forEach(function(p){ p.show(); });
          lasers.forEach(function(l){ l.show(); });
      } else if(menu) {
        this.showMenu();
      }
    }
  } // show

  this.loadLevel = function(l) {
    this.clearBricks();
    for(var y = 0; y < rows - 8; y++) {
      for(var x = 0; x < cols; x++) {
        if(l[y][x] !== 0) {
          bricks.push(new Brick(x, y, l[y][x]));
        }
      }
    }
    var str = "ROUND\t" + level + "\nPLAYER READY"
    this.showMessage(str, 150);
    S_Start_01.stop();
    S_Start_02.play();
  }

  this.updateScore = function(b) {
    var s = 0;
    switch(b.type) {
      case 2: s = 50 * level; break;
      case 3: s = 60;         break;
      case 4: s = 70;         break;
      case 5: s = 80;         break;
      case 6: s = 90;         break;
      case 7: s = 100;        break;
      case 8: s = 110;        break;
      case 9: s = 120;        break;
    }
    score += s;
    if(score > highScore) highScore = score;
  }

  this.clearBricks = function() { bricks = []; }

  this.clearPowerUps = function() {
    paddle.shrink();
    paddle.endLaser();
    balls.forEach(function(b){
      if(b.magnet) {
        b.demagnetize;
      }
      b.launch();
    });
  }

  this.isBricksEmpty = function() {
    result = true;
    bricks.forEach(function(b){
      if(b.type !== 1) result = false;
    });
    return result;
  }

  this.nextLevel = function() {
    paddle       = new Paddle();
    balls        = [ new Ball() ];
    bricks       = [];
    powerUps     = [];
    lasers       = [];
    level++;
    if(level > 10) level = 1;
    frameCounter = 0;

    var str = "Level_" + level;
    this.loadLevel(LEVELS[str]);
    }

  this.startGame = function() {
    paddle       = new Paddle();
    frameCounter = 0;
    var str = "Level_" + level;
    this.loadLevel(LEVELS[str]);
    menu = false;
  }

  this.changeLevel = function() {
    level++;
    if(level > 10) level = 1;
  }

  this.drawCourt = function() {
    image(SP_Background, pl, pt, cw, ch);
  }

  this.showGameInfo = function() {
    stroke(188, 25, 0);
    fill(188, 25, 0);
    textSize(25);
    textFont(F_Retro);
    textAlign(LEFT);
    text("HIGH" , w - pr + pl, pt + wall + bw      , pr, (ch/2));
    text("SCORE", w - pr + pl, pt + wall + bw +  25, pr, (ch/2));
    text("1UP"  , w - pr + pl, pt + wall + bw + 100, pr, (ch/2));
    text("LIVES", w - pr + pl, pt + wall + bw + 175, pr, (ch/2));
    text("ROUND", w - pr + pl, pt + wall + bw + 300, pr, (ch/2));

    stroke(255);
    fill(255);
    text(highScore, w - pr + pl, pt + wall + bw +  50,pr, (ch/2));
    text(score    , w - pr + pl, pt + wall + bw + 125,pr, (ch/2));
    text(lives    , w - pr + pl, pt + wall + bw + 200,pr, (ch/2));
    text(level    , w - pr + pl, pt + wall + bw + 325,pr, (ch/2));
    this.showPaused();
  }

  this.showPaused = function() {
    if(paused) {
      stroke(188, 25, 0);
      fill(188, 25, 0);
      textSize(25);
      textFont(F_Retro);
      textAlign(LEFT);
      text("PAUSED", w - pr + pl, pt + wall + bw + 250, pr, (ch/2));
    }
  }

  this.showMenu = function() {
    stroke(255);
    fill(255);
    textSize(35);
    textFont(F_Retro);
    textAlign(CENTER);
    text("ARKANOID"   , pl + wall, pt + wall + bw     , cw - bw, (ch/2));

    textSize(18);
    text("by aruvham" , pl + wall, pt + wall + bw + 25, cw - bw, (ch/2));

    textAlign(LEFT);
    text("POWERUPS : ", pl + (2*bh), h - (14*bh));
    image(SP_Power_01 , pl + (2*bh), h - (13*bh), bw, bh);
    text("EXTRA LIFE" , pl + (5*bh), h - (12*bh));
    image(SP_Power_02 , pl + (2*bh), h - (11*bh), bw, bh);
    text("TRIPLE"     , pl + (5*bh), h - (10*bh));
    image(SP_Power_03 , pl + (2*bh), h - (9*bh), bw, bh);
    text("EXPAND"     , pl + (5*bh), h - (8*bh));
    image(SP_Power_04 , pl + (2*bh), h - (7*bh), bw, bh);
    text("MAGNET"     , pl + (5*bh), h - (6*bh));
    image(SP_Power_05 , pl + (2*bh), h - (5*bh), bw, bh);
    text("LASER"      , pl + (5*bh), h - (4*bh));
    image(SP_Power_06 , pl + (2*bh), h - (3*bh), bw, bh);
    text("BALL SHOWER", pl + (5*bh), h - bw);

    text("CONTROLS : ", pl+wall+(cw/2), h-(14*bh));
    text("MOVE : 'A', 'D'", pl+wall+(cw/2), h-(12*bh));
    text("LAUNCH BALL : 'W'", pl+wall+(cw/2), h-(10*bh));
    text("SHOOT LASER : 'S'", pl+wall+(cw/2), h-(8*bh));
    text("PAUSE : 'ENTER'", pl+wall+(cw/2), h-(6*bh));
    text("QUIT : 'Q'", pl+wall+(cw/2), h-(4*bh));
    text("CHOOSE ROUND : 'R'", pl+wall+(cw/2), h-bw);

    stroke(188, 25, 0);
    fill(188, 25, 0);
    textAlign(CENTER);
    text("PRESS 'ENTER' TO START GAME", pl+wall, pt+wall+bw+100, cw-wall-wall, (ch/2));
  }

  this.showMessage = function(str, time, flag) {
    this.drawCourt();
    if(flag) {
      bricks.forEach(function(b) { b.show(); } );
      paddle.show();
      balls[0].show();
    }

    stopped = true;
    frameCounter = -time;

    stroke(255);
    fill(255);
    textSize(25);
    textFont(F_Retro);
    textAlign(CENTER);
    text(str, pl, pt+wall+bw+100, cw, (ch/2));
  }

  this.gameOver = function() {
    this.init();
    this.showMessage("GAME OVER", 150);
  }
} // Game

//-------------------------------------------------------------------------
// Paddle
//-------------------------------------------------------------------------

function Paddle() {
  this.w = pw;
  this.x = pl + (cw/2) - (this.w/2);
  this.y = h - (3*bh);

  // states
  this.expanded   = false;
  this.laser      = false;
  this.onCooldown = false;

  this.cooldown = 30; // 1/2 second
  this.frame;         // cooldown start frame

  this.update = function() {
    // move
    if(keyIsDown(KEY.A)) this.x -= 6;
    if(keyIsDown(KEY.D)) this.x += 6;
    /*
    if(AI && balls[0].moving) {
      this.x = balls[0].x - (this.w/2);
      balls.forEach(function(b){ b.launch(); });
      this.shoot();
    }*/

    this.x = constrain(this.x, pl + wall, w - pr - wall - this.w);

    // reset cooldown
    if(this.onCooldown) {
      if(frameCounter > this.frame + this.cooldown) this.onCooldown = false;
    }
  } // update

  this.show = function() {
         if(this.expanded) image(SP_Paddle_02, this.x, this.y, this.w, ph);
    else if(this.laser)    image(SP_Paddle_03, this.x, this.y, this.w, ph);
    else                   image(SP_Paddle_01, this.x, this.y, this.w, ph);
  }

  this.expand = function() {
    this.w = 100;
    S_Expand.play();
    this.expanded = true;
  }

  this.shrink = function() {
    this.w = 56;
    this.expanded = false;
  }

  this.initiateLaser = function() { this.laser = true; }

  this.endLaser      = function() { this.laser = false; }

  this.shoot = function() {
    if(this.laser && !this.onCooldown) {
      this.frame = frameCounter;
      S_Laser.play();
      lasers.push(new Laser(this.x + (  pw/4), this.y)); // left  laser
      lasers.push(new Laser(this.x + (3*pw/4), this.y)); // right laser
      this.onCooldown = true;
    }
  }
} // Paddle

//-------------------------------------------------------------------------
// Ball
//-------------------------------------------------------------------------

function Ball(x, y, dx, dy) {
  this.x = pl + (cw/2);
  this.y = h - (3*bh) - br;
  this.dx =  3;
  this.dy = -3;

  if(x) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  // states
  this.moving = false;
  this.magnet = false;

  this.offset = 0;

  this.update = function() {
    if(this.moving) {
      //edge collision
      if(this.x < pl + wall + br ||
         this.x > w - pr - wall - br) this.dx *= -1;
      if(this.y < pt + wall + br)       this.dy *= -1;

      // paddle collision
      if(this.dy > 0) {
        var point = ballInterceptPaddle(this);
        if(point) {
          this.hitPaddle(point);
          if(this.magnet) {
            S_Hit_04.play();
            this.moving = false;
            this.offset = this.x - paddle.x;
          } else {
            S_Hit_01.play();
          }
        }
      }

      // brick collision
      for(var i = bricks.length - 1; i > -1; i--) {
        var point = ballInterceptBrick(this, bricks[i]);
        if(point) {
          this.hitBrick(point);
          bricks[i].hp--;
          if(bricks[i].hp == 0) {
            game.updateScore(bricks[i]);
            // 8% power chance
            if(random() > 0.92 && bricks[i].type != 2) powerUps.push(new PowerUp(bricks[i].x, bricks[i].y));
            bricks.splice(i, 1);
            S_Hit_02.play(); // normal hit
          } else {
            S_Hit_03.play(); // metal hit
          }
        }
      }

      this.dx = constrain(this.dx, -10, 10);
      this.dy = constrain(this.dy, -10, 10);

      this.x += this.dx;
      this.y += this.dy;

      this.x = constrain(this.x, pl + wall + br - 1,
                                 w - pr - wall - br + 1);
      this.y = constrain(this.y, pt + wall + br - 1,
                                 h + (2*br));

    } else {
      if(this.magnet) {
        this.x = paddle.x + this.offset;
        this.y = h - (3*bh) - br;
      }
      else            this.x = paddle.x + (pw/2);
    }
  } // update

  this.show = function() {
    image(SP_Ball, this.x - br, this.y - br, 2*br, 2*br);
  }

  this.hitPaddle = function(point) {
    switch(point.d) {
      case "TOP":
        this.y = point.y;
        this.dy *= -1;
        break;
      case "TOP_RIGHT":
      case "TOP_LEFT":
        this.x = point.x;
        this.dx *= -1;
        this.y = point.y;
        this.dy *= -1;
        break;
      case "RIGHT":
      case "LEFT":
        this.x = point.x;
        this.dx *= -1;
        break;
    }

    // spin
    if(KEYIsDown(KEY.A)) this.dx = this.dx * (this.dx > 0 ? 0.6 : 1.05);
    if(KEYIsDown(KEY.D)) this.dx = this.dx * (this.dx < 0 ? 0.6 : 1.05);
  }

  this.hitBrick = function(point) {
    switch(point.d) {
      case "TOP":
      case "BOTTOM":
        this.y  = point.y;
        this.dy = -this.dy;
        break;
      case "RIGHT":
      case "LEFT":
        this.x  = point.x;
        this.dx = -this.dx;
        break;
    }

    // increase speed
    if(this.dx > 0) this.dx += .1 * (1 - (this.dx / 12));
    if(this.dx < 0) this.dx -= .1 * (1 - (this.dx / 12));
    if(this.dy > 0) this.dy += .1 * (1 - (this.dy / 12));
    if(this.dy < 0) this.dy -= .1 * (1 - (this.dy / 12));
  }

  this.launch = function() {
    this.moving = true;

    if(this.magnet) {
      if(this.offset > (paddle.w/2)) this.dx = Math.abs(this.dx);
      else                           this.dx = Math.abs(this.dx) * -1;
    }
  }

  this.destroyed = function() { return this.y > (h+br) ? true : false; }

  this.magnetize =   function() { this.magnet = true; }

  this.demagnetize = function() {
    this.magnet = false;
    this.launch();
  }

  this.triplicate = function() {
    balls.push(new Ball(this.x, this.y, random(-3, 3),
                        (Math.abs(this.dy)*-1)+random(-0.5, 0.5)));
    balls.push(new Ball(this.x, this.y, random(-3, 3),
                        (Math.abs(this.dy)*-1)+random(-0.5, 0.5)));

    balls.forEach(function(b){
      b.moving = true;
      if(this.magnet) b.magnetize();
    });
  }

  this.ballShower = function() {
    for(var i = 0; i < 5; i++) { this.triplicate(); }
  }

} // Ball

//-------------------------------------------------------------------------
// Brick
//-------------------------------------------------------------------------

function Brick(x, y, type) {
  this.x = pl + wall + (x*bw);
  this.y = pt + wall + (y*bh);
  this.type = type;

       if(this.type == 1) this.hp = Infinity;  // gold bricks
  else if(this.type == 2) this.hp = 2;         // silver bricks
  else                    this.hp = 1;         // color bricks

  this.show = function() {
    switch(this.type) {
      case 1:  image(SP_Brick_01, this.x, this.y, bw, bh); break;
      case 2:  image(SP_Brick_02, this.x, this.y, bw, bh); break;
      case 3:  image(SP_Brick_03, this.x, this.y, bw, bh); break;
      case 4:  image(SP_Brick_04, this.x, this.y, bw, bh); break;
      case 5:  image(SP_Brick_05, this.x, this.y, bw, bh); break;
      case 6:  image(SP_Brick_06, this.x, this.y, bw, bh); break;
      case 7:  image(SP_Brick_07, this.x, this.y, bw, bh); break;
      case 8:  image(SP_Brick_08, this.x, this.y, bw, bh); break;
      case 9:  image(SP_Brick_09, this.x, this.y, bw, bh); break;
    }
  }
} // Brick

//-------------------------------------------------------------------------
// PowerUp
//-------------------------------------------------------------------------

function PowerUp(x, y) {
  this.x = x;
  this.y = y;

  this.type;
  // types
  // 1 => extra life
  // 2 => tripe
  // 3 => expand
  // 4 => magnet
  // 5 => laser
  // 6 => ball shower

  var r = random();

       if(r < 0.10) this.type = 1;  // 10%
  else if(r < 0.30) this.type = 2;  // 20%
  else if(r < 0.50) this.type = 3;  // 20%
  else if(r < 0.70) this.type = 4;  // 20%
  else if(r < 0.90) this.type = 5;  // 20%
  else              this.type = 6;  // 10%

  this.update = function() {
    this.y++;
  }

  this.show = function() {
    switch(this.type) {
      case 1: image(SP_Power_01, this.x, this.y, bw, bh); break;
      case 2: image(SP_Power_02, this.x, this.y, bw, bh); break;
      case 3: image(SP_Power_03, this.x, this.y, bw, bh); break;
      case 4: image(SP_Power_04, this.x, this.y, bw, bh); break;
      case 5: image(SP_Power_05, this.x, this.y, bw, bh); break;
      case 6: image(SP_Power_06, this.x, this.y, bw, bh); break;
    }
  }

  this.hitPaddle = function() {
    if(this.y + bh > paddle.y &&
       this.y      < paddle.y + ph &&
       this.x      > paddle.x - bw &&
       this.x      < paddle.x + paddle.w) {

      switch(this.type) {
        case 1: lives++; S_Extra.play(); break;
        case 2: balls[0].triplicate();       break;
        case 3: game.clearPowerUps();
                paddle.expand();
                break;
        case 4: game.clearPowerUps();
                balls.forEach(function(b){
                  b.magnetize();
                });
                break;
        case 5: game.clearPowerUps();
                paddle.initiateLaser();
                break;
        case 6: balls[0].ballShower();       break;
      }
      return true;
    }
    return false;
  }
} // PowerUp

//-------------------------------------------------------------------------
// Laser
//-------------------------------------------------------------------------

function Laser(x, y) {
  this.x = x;
  this.y = y;

  this.update = function() {
    this.y -= 5;
  }

  this.show = function(){
    image(SP_Laser, this.x, this.y, 5, 10);
  }

  this.hitBrick = function(b) {
    if(this.y < b.y + bh &&
      this.x < b.x + bw &&
      this.x + 5 > b.x) {
      return true;
    }
    return false;
  }

  this.destroyed = function() {
    return (this.y < pt + wall) ? true : false;
  }
} // Laser

//-------------------------------------------------------------------------
// helper methods
//-------------------------------------------------------------------------

function intercept(ax, ay, bx, by, cx, cy, dx, dy, label) {
  // line AB is ball movement
  // line CD is rectangle side
  var denom = ((dy-cy) * (bx-ax)) - ((dx-cx) * (by-ay));
  if (denom != 0) {
    var ua = (((dx-cx) * (ay-cy)) - ((dy-cy) * (ax-cx))) / denom;
    if ((ua >= 0) && (ua <= 1)) {
      var ub = (((bx-ax) * (ay-cy)) - ((by-ay) * (ax-cx))) / denom;
      if ((ub >= 0) && (ub <= 1)) {
        var x = ax + (ua * (bx-ax));
        var y = ay + (ua * (by-ay));
        return { x: x, y: y, d: label};
      }
    }
  }
  return null;
}

function ballInterceptPaddle(ball) {
  var point;
  point = intercept(ball.x, ball.y,
                 ball.x + ball.dx, ball.y + ball.dy,
                 paddle.x, paddle.y - br,
                 paddle.x + paddle.w, paddle.y - br, "TOP");
  if(!point && ball.dx < 0) {
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x + paddle.w, paddle.y - br,
                   paddle.x + paddle.w + br, paddle.y, "TOP_RIGHT");
  }
  if(!point && ball.dx < 0) {
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x + paddle.w + br, paddle.y,
                   paddle.x + paddle.w + br, paddle.y + ph, "RIGHT");
  }
  if(!point && ball.dx > 0) {
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x, paddle.y - br,
                   paddle.x - br, paddle.y, "TOP_LEFT");
  }
  if(!point && ball.dx > 0) {
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x - br, paddle.y,
                   paddle.x - br, paddle.y + ph, "LEFT");
  }
  if(!point) {   // second hitbox
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x, paddle.y + (ph/2) - br,
                   paddle.x + paddle.w, paddle.y + (ph/2) - br, "TOP");
  }
  return point;
}

function ballInterceptBrick(ball, b) {
  var point;
  if(ball.dx < 0) {
    point = interces(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x + bw + br, b.y - br,
                   b.x + bw + br, b.y + bh + br, "RIGHT");
  }
  if (!point && ball.dx > 0) {
    point = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x - br, b.y - br,
                   b.x - br, b.y + bh + br, "LEFT");
  }
  if(!point && ball.dy < 0) {
      point = intercept(ball.x, ball.y,
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x - br, b.y + bh + br,
                     b.x + bw + br, b.y + bh + br, "BOTTOM");
  }
  if(!point && ball.dy > 0) {
      point = intercept(ball.x, ball.y,
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x - br, b.y - br,
                     b.x + bw + br, b.y - br, "TOP");
  }
  return pt;
}

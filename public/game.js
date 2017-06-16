// Arkanoid by aruvham
// 9 Dic 2016

//-------------------------------------------------------------------------
// game constants
//-------------------------------------------------------------------------
                   // pt => hit
var WIDTH   = 546, //w h pt pr pl wt wr wl cw ch pw ph bw bh br cols rows
    HEIGHT  = 434,
    PADDING = { t:  14, r: 168, l: 42 },
    WALL    = { t:  14, r:  14, l: 14 },
    COURT   = { w: 336, h: 420 },
    PADDLE  = { w:  56, h:  14 },
    BRICK   = { w:  28, h:  14 },
    BR      =   5,
    COLS    =  11,
    ROWS    =  30,
    KEY     = { A: 65, D: 68, Q: 81, R: 82, S: 83, W: 87 };

//-------------------------------------------------------------------------
// game variables
//-------------------------------------------------------------------------

var game,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    highScore = 25000,
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
    //AI = true;

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
  S_Expand      = loadSound("assets/S_Expand.wav"); S_Expand.playMode("restart");
  S_Extra       = loadSound("assets/S_Extra.wav");  S_Extra.playMode("restart");
  S_Explosion_01= loadSound("assets/S_Explosion_01.wav");  S_Explosion_01.playMode("restart");
  S_Hit_01      = loadSound("assets/S_Hit_01.wav"); S_Hit_01.playMode("restart"); // paddle
  S_Hit_02      = loadSound("assets/S_Hit_02.wav"); S_Hit_02.playMode("restart"); // brick
  S_Hit_03      = loadSound("assets/S_Hit_03.wav"); S_Hit_03.playMode("restart"); // metal
  S_Hit_04      = loadSound("assets/S_Hit_04.wav"); S_Hit_04.playMode("restart"); // magnet
  S_Laser       = loadSound("assets/S_Laser.wav");
  S_Start_01    = loadSound("assets/S_Start_01.wav"); // init
  S_Start_02    = loadSound("assets/S_Start_02.wav"); // loadLevel
}

//-------------------------------------------------------------------------
// setup
//-------------------------------------------------------------------------

function setup() {
  createCanvas(WIDTH, HEIGHT);
  game = new Game();
  game.init();
}

//-------------------------------------------------------------------------
// draw
//-------------------------------------------------------------------------

function draw() {
  //debugger;
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
    highScore    = 25000,
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
              this.showMessage("\n\n\nPLAYER READY", 90, "f");
            } else {
              //debugger;
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
    for(var y = 0; y < ROWS - 8; y++) {
      for(var x = 0; x < COLS; x++) {
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
      case 2:  s = 50 * level; break;
      case 3:  s = 60;         break;
      case 4:  s = 70;         break;
      case 5:  s = 80;         break;
      case 6:  s = 90;         break;
      case 7:  s = 100;        break;
      case 8:  s = 110;        break;
      case 9:  s = 120;        break;
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
    image(SP_Background, PADDING.l, PADDING.t, COURT.w, COURT.h);
  }

  this.showGameInfo = function() {
    stroke(188, 25, 0);
    fill(  188, 25, 0);
    textSize(25);
    textFont(F_Retro);
    textAlign(LEFT);
    text("HIGH" , WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h),
                  PADDING.r, (COURT.h/2));
    text("SCORE", WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 25,
                  PADDING.r, (COURT.h/2));
    text("1UP"  , WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 100,
                  PADDING.r, (COURT.h/2));
    text("LIVES", WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 175,
                  PADDING.r, (COURT.h/2));
    text("ROUND", WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 300,
                  PADDING.r, (COURT.h/2));
    stroke(255);
    fill(  255);
    text(highScore, WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 50,
                PADDING.r, (COURT.h/2));
    text(score, WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 125,
                PADDING.r, (COURT.h/2));
    text(lives, WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 200,
                PADDING.r, (COURT.h/2));
    text(level, WIDTH - PADDING.r + PADDING.l, PADDING.t + WALL.t + (2*BRICK.h) + 325,
                PADDING.r, (COURT.h/2));
    this.showPaused();
  }

  this.showPaused = function() {
    if(paused) {
      stroke(188, 25, 0);
      fill(188, 25, 0);
      textSize(25);
      textFont(F_Retro);
      textAlign(LEFT);
      text("PAUSED", WIDTH - PADDING.r + PADDING.l,
           PADDING.t + WALL.t + (2*BRICK.h) + 250, PADDING.r, (COURT.h/2));
    }
  }

  this.showMenu = function() {
    stroke(255);
    fill(255);
    textSize(35);
    textFont(F_Retro);
    textAlign(CENTER);
    text("ARKANOID", PADDING.l+WALL.l, PADDING.t+WALL.t+(2*BRICK.h), COURT.w-WALL.l-WALL.r, (COURT.h/2));

    textSize(18);
    text("by aruvham", PADDING.l+WALL.l, PADDING.t+WALL.t+(2*BRICK.h)+25, COURT.w-WALL.l-WALL.r, (COURT.h/2));

    textAlign(LEFT);
    text("POWERUPS : ", PADDING.l+WALL.l+WALL.l, HEIGHT-(14*BRICK.h));
    image(SP_Power_01, PADDING.l+WALL.l+WALL.l, HEIGHT-(13*BRICK.h), BRICK.w, BRICK.h);
    text("EXTRA LIFE", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(12*BRICK.h));
    image(SP_Power_02, PADDING.l+WALL.l+WALL.l, HEIGHT-(11*BRICK.h), BRICK.w, BRICK.h);
    text("TRIPLE", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(10*BRICK.h));
    image(SP_Power_03, PADDING.l+WALL.l+WALL.l, HEIGHT-(9*BRICK.h), BRICK.w, BRICK.h);
    text("EXPAND", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(8*BRICK.h));
    image(SP_Power_04, PADDING.l+WALL.l+WALL.l, HEIGHT-(7*BRICK.h), BRICK.w, BRICK.h);
    text("MAGNET", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(6*BRICK.h));
    image(SP_Power_05, PADDING.l+WALL.l+WALL.l, HEIGHT-(5*BRICK.h), BRICK.w, BRICK.h);
    text("LASER", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(4*BRICK.h));
    image(SP_Power_06, PADDING.l+WALL.l+WALL.l, HEIGHT-(3*BRICK.h), BRICK.w, BRICK.h);
    text("BALL SHOWER", PADDING.l+WALL.l+WALL.l+WALL.l+BRICK.w, HEIGHT-(2*BRICK.h));

    text("CONTROLS : ", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(14*BRICK.h));
    text("MOVE : 'A', 'D'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(12*BRICK.h));
    text("LAUNCH BALL : 'W'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(10*BRICK.h));
    text("SHOOT LASER : 'S'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(8*BRICK.h));
    text("PAUSE : 'ENTER'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(6*BRICK.h));
    text("QUIT : 'Q'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(4*BRICK.h));
    text("CHOOSE ROUND : 'R'", PADDING.l+WALL.l+(COURT.w/2), HEIGHT-(2*BRICK.h));

    stroke(188, 25, 0);
    fill(188, 25, 0);
    textAlign(CENTER);
    text("PRESS 'ENTER' TO START GAME", PADDING.l+WALL.l, PADDING.t+WALL.t+(2*BRICK.h)+100, COURT.w-WALL.l-WALL.r, (COURT.h/2));
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
    text(str, PADDING.l, PADDING.t+WALL.t+(2*BRICK.h)+100, COURT.w, (COURT.h/2));
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
  this.w = PADDLE.w;
  this.x = PADDING.l + (COURT.w/2) - (this.w/2);
  this.y = HEIGHT - (3*BRICK.h);

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

    this.x = constrain(this.x, PADDING.l + WALL.l, WIDTH - PADDING.r - WALL.r - this.w);

    // reset cooldown
    if(this.onCooldown) {
      if(frameCounter > this.frame + this.cooldown) this.onCooldown = false;
    }
  } // update

  this.show = function() {
         if(this.expanded) image(SP_Paddle_02, this.x, this.y, this.w, PADDLE.h);
    else if(this.laser)    image(SP_Paddle_03, this.x, this.y, this.w, PADDLE.h);
    else                   image(SP_Paddle_01, this.x, this.y, this.w, PADDLE.h);
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
      lasers.push(new Laser(this.x + (  PADDLE.w/4), this.y)); // left  laser
      lasers.push(new Laser(this.x + (3*PADDLE.w/4), this.y)); // right laser
      this.onCooldown = true;
    }
  }
} // Paddle

//-------------------------------------------------------------------------
// Ball
//-------------------------------------------------------------------------

function Ball(x, y, dx, dy) {
  this.x = PADDING.l + (COURT.w/2);
  this.y = HEIGHT - (3*BRICK.h) - BR;
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
      if(this.x < PADDING.l + WALL.l + BR ||
         this.x > WIDTH - PADDING.r - WALL.r - BR) this.dx *= -1;
      if(this.y < PADDING.t + WALL.t + BR)       this.dy *= -1;

      // paddle collision
      if(this.dy > 0) {
        var pt = ballInterceptPaddle(this);
        if(pt) {
          this.hitPaddle(pt);
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
        var pt = ballInterceptBrick(this, bricks[i]);
        if(pt) {
          this.hitBrick(pt);
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

      this.x = constrain(this.x, PADDING.l + WALL.l + BR - 1,
                                 WIDTH - PADDING.r - WALL.r - BR + 1);
      this.y = constrain(this.y, PADDING.t + WALL.t + BR - 1,
                                 HEIGHT + (2*BR));

    } else {
      if(this.magnet) {
        this.x = paddle.x + this.offset;
        this.y = HEIGHT - (3*BRICK.h) - BR;
      }
      else            this.x = paddle.x + (PADDLE.w/2);
    }
  } // update

  this.show = function() {
    image(SP_Ball, this.x - BR, this.y - BR, 2*BR, 2*BR);
  }

  this.hitPaddle = function(pt) {
    switch(pt.d) {
      case "TOP":
        this.y = pt.y;
        this.dy *= -1;
        break;
      case "TOP_RIGHT":
      case "TOP_LEFT":
        this.x = pt.x;
        this.dx *= -1;
        this.y = pt.y;
        this.dy *= -1;
        break;
      case "RIGHT":
      case "LEFT":
        this.x = pt.x;
        this.dx *= -1;
        break;
    }

    // spin
    if(keyIsDown(KEY.A)) this.dx = this.dx * (this.dx > 0 ? 0.6 : 1.05);
    if(keyIsDown(KEY.D)) this.dx = this.dx * (this.dx < 0 ? 0.6 : 1.05);
  }

  this.hitBrick = function(pt) {
    switch(pt.d) {
      case "TOP":
      case "BOTTOM":
        this.y  = pt.y;
        this.dy = -this.dy;
        break;
      case "RIGHT":
      case "LEFT":
        this.x  = pt.x;
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

  this.destroyed = function() { return this.y > (HEIGHT+BR) ? true : false; }

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
  this.x = PADDING.l + WALL.l + (x*BRICK.w);
  this.y = PADDING.t + WALL.t + (y*BRICK.h);
  this.type = type;

       if(this.type == 1) this.hp = Infinity;  // gold bricks
  else if(this.type == 2) this.hp = 2;         // silver bricks
  else                    this.hp = 1;         // color bricks

  this.show = function() {
    switch(this.type) {
      case 1:  image(SP_Brick_01, this.x, this.y, BRICK.w, BRICK.h); break;
      case 2:  image(SP_Brick_02, this.x, this.y, BRICK.w, BRICK.h); break;
      case 3:  image(SP_Brick_03, this.x, this.y, BRICK.w, BRICK.h); break;
      case 4:  image(SP_Brick_04, this.x, this.y, BRICK.w, BRICK.h); break;
      case 5:  image(SP_Brick_05, this.x, this.y, BRICK.w, BRICK.h); break;
      case 6:  image(SP_Brick_06, this.x, this.y, BRICK.w, BRICK.h); break;
      case 7:  image(SP_Brick_07, this.x, this.y, BRICK.w, BRICK.h); break;
      case 8:  image(SP_Brick_08, this.x, this.y, BRICK.w, BRICK.h); break;
      case 9:  image(SP_Brick_09, this.x, this.y, BRICK.w, BRICK.h); break;
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
      case 1: image(SP_Power_01, this.x, this.y, BRICK.w, BRICK.h); break;
      case 2: image(SP_Power_02, this.x, this.y, BRICK.w, BRICK.h); break;
      case 3: image(SP_Power_03, this.x, this.y, BRICK.w, BRICK.h); break;
      case 4: image(SP_Power_04, this.x, this.y, BRICK.w, BRICK.h); break;
      case 5: image(SP_Power_05, this.x, this.y, BRICK.w, BRICK.h); break;
      case 6: image(SP_Power_06, this.x, this.y, BRICK.w, BRICK.h); break;
    }
  }

  this.hitPaddle = function() {
    if(this.y + BRICK.h > paddle.y &&
       this.y      < paddle.y + PADDLE.h &&
       this.x      > paddle.x - BRICK.w &&
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
    if(this.y < b.y + BRICK.h &&
      this.x < b.x + BRICK.w &&
      this.x + 5 > b.x) {
      return true;
    }
    return false;
  }

  this.destroyed = function() {
    return (this.y < PADDING.t + WALL.t) ? true : false;
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
  var pt;
  pt = intercept(ball.x, ball.y,
                 ball.x + ball.dx, ball.y + ball.dy,
                 paddle.x, paddle.y - BR,
                 paddle.x + paddle.w, paddle.y - BR, "TOP");
  if(!pt && ball.dx < 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x + paddle.w, paddle.y - BR,
                   paddle.x + paddle.w + BR, paddle.y, "TOP_RIGHT");
  }
  if(!pt && ball.dx < 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x + paddle.w + BR, paddle.y,
                   paddle.x + paddle.w + BR, paddle.y + PADDLE.h, "RIGHT");
  }
  if(!pt && ball.dx > 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x, paddle.y - BR,
                   paddle.x - BR, paddle.y, "TOP_LEFT");
  }
  if(!pt && ball.dx > 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x - BR, paddle.y,
                   paddle.x - BR, paddle.y + PADDLE.h, "LEFT");
  }
  if(!pt) {   // second hitbox
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x, paddle.y + (PADDLE.h/2) - BR,
                   paddle.x + paddle.w, paddle.y + (PADDLE.h/2) - BR, "TOP");
  }
  return pt;
}

function ballInterceptBrick(ball, b) {
  var pt;
  if(ball.dx < 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x + BRICK.w + BR, b.y - BR,
                   b.x + BRICK.w + BR, b.y + BRICK.h + BR, "RIGHT");
  }
  if (!pt && ball.dx > 0) {
    pt = intercept(ball.x, ball.y,
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x - BR, b.y - BR,
                   b.x - BR, b.y + BRICK.h + BR, "LEFT");
  }
  if(!pt && ball.dy < 0) {
      pt = intercept(ball.x, ball.y,
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x - BR, b.y + BRICK.h + BR,
                     b.x + BRICK.w + BR, b.y + BRICK.h + BR, "BOTTOM");
  }
  if(!pt && ball.dy > 0) {
      pt = intercept(ball.x, ball.y,
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x - BR, b.y - BR,
                     b.x + BRICK.w + BR, b.y - BR, "TOP");
  }
  return pt;
}

// Arkanoid by arturham
// 8 Dic 2016

//-------------------------------------------------------------------------
// game variables
//-------------------------------------------------------------------------

var w  = 546,   // canvas width
    h  = 434,   // canvas height
    ptop = 14,  // padding top
    pr = 168,   // padding right
    pl = 42,    // padding left
    wt = 14,    // wall top
    wr = 14,    // wall right
    wl = 14,    // wall left
    cw = 336,   // court width
    ch = 420,   // court height
    pw = 56,    // paddle width
    ph = 14,    // paddle height
    bw = 28,    // brick width
    bh = 14,    // brick height
    br = 5,     // ball radius
    cols = 11,
    rows = 30;

var paused = false,
    menu = true;

var score = 0,
    highScore = 25000,
    thisRound = 0,
    lives = 3;

var fCounter = 1,
    stop = false;

var blue_bg,
    red_paddle,
    gold_brick,
    silver_brick,
    blue_brick,
    turquoise_brick,
    orange_brick,
    yellow_brick,
    pink_brick,
    red_brick,
    white_brick,
    green_brick;

var hit_sound1,
    hit_sound2,
    hit_sould3;

function preload() {
  retroFont       = loadFont( "assets/red-alert.ttf");
  
  blue_bg         = loadImage("assets/blue-bg.png");
  
  red_paddle      = loadImage("assets/red-paddle.png");
  small_paddle    = loadImage("assets/small-paddle.png");
  large_paddle    = loadImage("assets/large-paddle.png");
  laser_paddle    = loadImage("assets/laser-paddle.png"); 
  laser_sprite    = loadImage("assets/laser.png");
  
  ball_sprite     = loadImage("assets/ball.png");
  
  blue_brick      = loadImage("assets/blue-brick.png");
  gold_brick      = loadImage("assets/gold-brick.png");
  green_brick     = loadImage("assets/green-brick.png");
  white_brick     = loadImage("assets/white-brick.png");
  silver_brick    = loadImage("assets/silver-brick.png");
  turquoise_brick = loadImage("assets/turquoise-brick.png");
  yellow_brick    = loadImage("assets/yellow-brick.png");
  pink_brick      = loadImage("assets/pink-brick.png");
  orange_brick    = loadImage("assets/orange-brick.png");
  red_brick       = loadImage("assets/red-brick.png");
  
  extra_power    = loadImage("assets/extra-power.png");
  laser_power    = loadImage("assets/laser-power.png");
  triple_power   = loadImage("assets/triple-power.png");
  shower_power   = loadImage("assets/shower-power.png");
  magnet_power   = loadImage("assets/magnet-power.png");
  grow_power     = loadImage("assets/large-power.png");
  
  
  
  hit_sound1      = loadSound("assets/Arkanoid SFX-(6).wav");
  hit_sound2      = loadSound("assets/Arkanoid SFX-(8).wav");
  hit_sound3      = loadSound("assets/Arkanoid SFX-(7).wav");
  start_sound     = loadSound("assets/start-sound-arkanoid.wav");
  grow_sound      = loadSound("assets/arkanoid-grow.wav");
  extra_sound     = loadSound("assets/arkanoid-extra.wav");
  destroy_sound   = loadSound("assets/arkanoid-destroy.wav");
  hit_paddle_sound   = loadSound("assets/hit-paddle-sound.wav");
  hit_brick_sound   = loadSound("assets/hit-brick-sound.wav");
  hit_metal_sound   = loadSound("assets/hit-metal-sound.wav");
  laser_sound   = loadSound("assets/laser-sound-arkanoid.wav");
  hit_magne_sound   = loadSound("assets/magnetize-hit-paddle.wav");
  
  hit_sound1.playMode("restart");
  hit_sound2.playMode("restart");
  hit_sound3.playMode("restart");
  start_sound.playMode("restart");
  hit_paddle_sound.playMode("restart");
  hit_brick_sound.playMode("restart");
  hit_metal_sound.playMode("restart");
  laser_sound.playMode("restart");
  hit_magne_sound.playMode("restart");
}

function setup() {
  createCanvas(w, h);
  paddle = new Paddle();
  balls = [new Ball()];
  bricks = [];
  powerUps = [];
  
  lasers = [];

  //loadLevel(round_1);
}

function draw() {
  


  if(!stop && !menu) {
    
    background(0);
     drawCourt(); 
    showScore();
    showHighScore();
    showLives();
    showRound();
      if(!paused) {
        
    for(var i = powerUps.length - 1; i>=0; i--) {
      powerUps[i].update();
      if(powerUps[i].hitPaddle()) {
        powerUps.splice(i,1);
      }
    }
        
    paddle.update();
        
    for(var i = balls.length - 1; i >= 0; i--) {
      balls[i].update();
      if(balls[i].destroyed()){
        balls.splice(i, 1);
        if(balls.length == 0) {
          lives--;
          powerUps = [];
          clearPowerUps();
          destroy_sound.play();
          paddle.x = pl+(cw/2)-(pw/2);
          showMessage("\n\n\nPLAYER READY", 90);
          if(lives > 0)balls.push(new Ball());
          
        } 
      } 
    }
        
    for(var i = lasers.length-1; i >= 0; i--) {
      lasers[i].update();
      for(var j = bricks.length-1; j >= 0; j--) {
        if(lasers[i].hitBrick(bricks[j])) {
          lasers.splice(i, 1);
          bricks[j].hp--;
          if(bricks[j].hp === 0){
            updateScore(bricks[j]);
            bricks.splice(j, 1);
          } 
          break;
        }
      }
    }

  }
  

    
  balls.forEach(function(ball){
    ball.show();
  })
  

  
  bricks.forEach(function(b){
    b.show();
  });
  powerUps.forEach(function(pUp){
    pUp.show();
  })
  
  lasers.forEach(function(l){
    l.show();
  });
  
  paddle.show();
  
          if(checkCourtEmpty()) {
         nextRound();  
       }
    
    if(paused) {
      showPauseScreen();
    }
    
    if(lives === 0){
            gameOver();
          }
    

  }
  
  if(!stop && menu) showMenu();
  
  fCounter++;
  if(fCounter == 0) {
    stop = false;
  }
}

function Paddle() {
  this.x = pl+(cw/2)-(pw/2);
  this.y = h-(3*bh);
  this.lastX = this.x;
  this.dx;
  this.large = false;
  
  
  this.laser = false;
  this.cooldown = false;
  
  this.laserCooldown = 30;
  this.fCounterStart;

  this.show = function() {
    if(!this.large){
      
    image(small_paddle, this.x, this.y, pw, ph);

    }   else if(this.large) {
      
    /*noStroke();
    fill(255, 0, 0, 150);
    rect(this.x, this.y, pw, ph);*/
      
      image(large_paddle, this.x, this.y, pw, ph);
    } 
    
    if(this.laser) {
      console.laser;
      image(laser_paddle, this.x, this.y, pw, ph);
    }

  }
    
    this.showHitbox = function() {
      
    stroke(255, 0, 0);
    //r
    line(this.x+pw+br, this.y, this.x+pw+br, this.y+ph);
    //l
    line(this.x-br, this.y, this.x-br, this.y+ph);
    //b
    line(this.x, this.y+ph+br, this.x+pw, this.y+ph+br);
    //t
    line(this.x, this.y-br, this.x+pw, this.y-br);
    
    stroke(0, 255, 0);
    //tr
    line(this.x+pw, this.y-br, this.x+pw+br, this.y);
    //tl
    line(this.x, this.y-br, this.x-br, this.y); 
    }
  
  this.update = function() {
    // if mouse is currently on the court
    if(mouseX > pl+wl && mouseX < w-pr-wr && 
       mouseY > ptop+wt && mouseY < h) {
      //noCursor();
      // move
      this.x = constrain(mouseX, pl+wl, w-pr-wr-pw);
            
      // calculate dx 
      this.dx = this.x - this.lastX;
      this.lastX = this.x;
    } else {
      cursor(ARROW);
      this.dx = 0;
    }
    
    //console.log("fCounter : " + fCounter + " target : " + this.fCounterStart+this.laserCooldown + " cooldown : " + this.cooldown);
    if(this.laser){
          if(fCounter > this.fCounterStart+this.laserCooldown) {
      this.cooldown = false;
    }
    }

  }
  
  this.grow = function() {
    grow_sound.play();
    this.large = true;
    pw = 100;
  }
   this.shrink = function() {
     pw = 56;
     this.large = false;
     
   }
   
   this.shoot = function() {
     if(this.laser && !this.cooldown){
            console.log("SHOOT!");
       //console.log(fCounter);
     this.fCounterStart = fCounter;
     lasers.push(new Laser(this.x+(pw/4), this.y));
     lasers.push(new Laser(this.x+(3*pw/4), this.y));
       laser_sound.play();
       this.cooldown = true;
     }

   }
   
   this.beginLaser = function() {
     this.laser = true;
   }
   
   this.endLaser = function() {
     this.laser = false;
    this.cooldown = false;
    this.fCounterStart = 0;
   }
}

function Ball(x, y, dx) {
  
  this.magnet = false;
  this.Xoffset;
  
  
  this.moving = false;
  this.x = pl+(cw/2);
  this.y = h-(3*bh)-br;
  this.dx =  3;
  this.dy = -3;
  
  if(x) this.x = x;
  if(y) this.y = y;
  if(dx) {
    this.dx = dx;
    this.moving = true;
  }
  
  this.show = function() {
    image(ball_sprite, this.x-br, this.y-br, br, br);
    
    /*noStroke();
    fill(255, 0, 0, 150);
    ellipse(this.x, this.y, br*2, br*2);*/
  }
  
  this.update = function() {
    //debugger;
    if(this.moving) {
          if(this.x < pl+wl+br || this.x > w-pr-wr-br)
      this.dx *= -1;

    if(this.y < ptop+wt+br /*|| this.y > h-br*/){      
      //debugger;
      this.dy *= -1;}
    
    if(this.dy > 0) {
      var pt = ballInterceptPaddle(this);
      if(pt) this.hitPaddle(pt);
      // second hitbox
      if(!pt) {
        pt = intercept(this.x, this.y,
                       this.x +this.dx, this.y+this.dy,
                       paddle.x        , paddle.y-br+(ph/2),
                       paddle.x+pw     , paddle.y-br+(ph/2), "TOP");
        if(pt) this.hitPaddle(pt);
      }
      
      // magnet ball
      if(pt) {
        if(this.magnet) {
          this.moving = false;
          this.Xoffset = this.x - paddle.x;

        }
      }
      
    
    }
    
    for(var i = bricks.length - 1; i > -1; i--) {
      var pt = ballInterceptBrick(this, bricks[i]);
      if(pt) {
        //debugger;
        this.hitBrick(bricks[i], pt);
        // why this not inside hitBrick method??
        bricks[i].hp--;
        if(bricks[i].hp == 0) {
          updateScore(bricks[i]);
          bricks.splice(i, 1); 
        } 
      }
    } 
    
    this.dx = constrain(this.dx, -10, 10);
    this.dy = constrain(this.dy, -10, 10);
    
    this.x += this.dx;
    this.y += this.dy;
    
    this.x = constrain(this.x, pl+wl+br-1, w-pr-wr-br+1);
    this.y = constrain(this.y, ptop+wt+br-1, h+(2*br));
    //console.log(ptop+wt+br-1);
    //console.log(ptop+wt+br-1);
      
    } else {
      //NOT MOVIN
      //console.log("not movin'");
      if(this.magnet) {
        this.x = paddle.x + this.Xoffset;
      } else {
        this.x = paddle.x + (pw/2);
      }
    }
    
    this.triplicate = function() {
      balls.push(new Ball(this.x, this.y, random(-3, 3), random(-3, 3)));
      balls.push(new Ball(this.x, this.y, random(-3, 3), random(-3, 3)));
      
      if(this.magnet) {
        balls.forEach(function(b){
          b.magnetize();
        })
      }
    }
  }
  
  this.hitPaddle = function(pt) {
    
    switch(pt.d) {
      case "TOP":
        this.y = pt.y;
        this.dy = -this.dy;
        break;
      case "TOP_RIGHT":
      case "TOP_LEFT":
        this.x = pt.x;
        this.dx = -this.dx;
        this.y = pt.y;
        this.dy = -this.dy;
        break;
      case "RIGHT":
      case "LEFT":
        this.x = pt.x;
        this.dx = -this.dx;
        break;
    } 

    if(paddle.dx > 0)
      this.dx = this.dx * (this.dx < 0 ? 0.6 : 1.05);
    
    else if(paddle.dx < 0)
      this.dx = this.dx * (this.dx > 0 ? 0.6 : 1.05);
    
    
    if(this.magnet) {
      hit_magne_sound.play();
      moving = false;
    } else {
          hit_paddle_sound.play();
    }

  }
  
  this.hitBrick = function(b, pt) {

    switch(pt.d) {
      case "TOP":
      case "BOTTOM":
        this.y = pt.y;
        this.dy = -this.dy;
        break;
      case "RIGHT":
      case "LEFT":
        this.x = pt.x;
        this.dx = -this.dx;
        break;
    } 
    
    if(this.dx > 0) this.dx += .05 * (1 - (this.dx / 12));
    if(this.dx < 0) this.dx -= .05 * (1 - (this.dx / 12));
    if(this.dy > 0) this.dy += .05 * (1 - (this.dy / 12));
    if(this.dy < 0) this.dy -= .05 * (1 - (this.dy / 12));

    
    if(b.type == 1 || b.type == 2) {
      if(b.hp > 0 )hit_sound2.play();
    }
    else {
     hit_brick_sound.play();
     if(random() > 0.95) {
       powerUps.push(new PowerUp(b.x, b.y));
     }
    }
    
  }
  
  this.launch = function() {
    this.moving = true;
    if(this.magnet) {
      if(this.Xoffset > (pw/2)) {
        this.dx = Math.abs(this.dx);
      } else {
        this.dx = Math.abs(this.dx) * -1;
      }
    }
  }
  
  this.destroyed = function() {
    if(this.y > h+br) {
      //play sound
      //console.log("DESTROYED");
      return true;
    }
  }
  
  this.magnetize = function() {
    this.magnet = true;
  }
  
  this.demagnetize = function() {
    this.magnet = false;

  }
  
  this.ballShower = function() {
    for(var i = 0; i < 6; i++) {
      this.triplicate();
    }
    balls.slice(0, 1);
  }
  
}

function Brick(x, y, type) {
  this.type = type;
  this.hp = 1;
  
  if(this.type == 1) this.hp = Infinity;  // gold bricks
  if(this.type == 2) this.hp = 2;         // silver bricks
  
  this.x = pl+wl+(x*bw);
  this.y = ptop+wt+(y*bh);
  
  this.show = function() {
    switch(this.type) {
      case 1: image(gold_brick, this.x, this.y, bw, bh);
              break;
      case 2: image(silver_brick, this.x, this.y, bw, bh);
              break;
      case 3: image(red_brick, this.x, this.y, bw, bh);
              break;
      case 4: image(green_brick, this.x, this.y, bw, bh);
              break;
      case 5: image(blue_brick, this.x, this.y, bw, bh);
              break;
      case 6: image(pink_brick, this.x, this.y, bw, bh);
              break;
      case 7: image(yellow_brick, this.x, this.y, bw, bh);
              break;
      case 8: image(turquoise_brick, this.x, this.y, bw, bh);
              break;
      case 9: image(orange_brick, this.x, this.y, bw, bh);
              break;
      case 10: image(white_brick, this.x, this.y, bw, bh);
              break;
    }
    /*stroke(0);
    fill(colors[type]);
    rect(this.x, this.y, bw, bh);*/
  }
}

function drawCourt() {
  /*rectMode(CORNER);
  noStroke();
  fill(0, 0, 255, 100);
  rect(pl, ptop, cw, ch);         // court bg
  fill(100);
  rect(pl, ptop, wl, ch);         // left wall
  rect(w-pr-wr, ptop, wr, ch);    // right wall
  rect(pl, ptop, cw, wt);         // top wall*/
  
  image(blue_bg, pl, ptop, cw, ch);
}

function drawGrid() {
  stroke(0);
  // vertical lines
  for(var i = 0; i < cols + 1; i++) {
    line(pl+wl+(bw*i), ptop+wt, pl+wl+(bw*i), h);
  }
  // horizontal lines
  for(var i = 0; i < rows + 1; i++) {
    line(pl+wl, ptop+wt+(bh*i), w-pr-wr, ptop+wt+(bh*i));
  }
}

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

  pt = intercept(ball.x          , ball.y, 
                 ball.x + ball.dx, ball.y + ball.dy,
                 paddle.x        , paddle.y-br,
                 paddle.x+pw     , paddle.y-br, "TOP");
  if(!pt && ball.dx < 0) {
    pt = intercept(ball.x          , ball.y, 
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x+pw     , paddle.y-br,
                   paddle.x+pw+br  , paddle.y, "TOP_RIGHT");
  }
  if(!pt && ball.dx > 0) {
    pt = intercept(ball.x          , ball.y, 
                   ball.x + ball.dx, ball.y + ball.dy,
                   paddle.x        , paddle.y-br,
                   paddle.x-br     , paddle.y, "TOP_LEFT");
  }
  if(!pt) {
    if(ball.dx < 0) {
      pt = intercept(ball.x          , ball.y, 
                     ball.x + ball.dx, ball.y + ball.dy,
                     paddle.x+pw+br  , paddle.y,
                     paddle.x+pw+br  , paddle.y+ph, "RIGHT");
    } 
    else if (ball.dx > 0) {
      pt = intercept(ball.x          , ball.y, 
                     ball.x + ball.dx, ball.y + ball.dy,
                     paddle.x-br     , paddle.y,
                     paddle.x-br     , paddle.y+ph, "LEFT");
    }
  }
  return pt; 
}
  
function ballInterceptBrick(ball, b) {
  var pt;
  
  if(ball.dx < 0) {
    pt = intercept(ball.x          , ball.y, 
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x+bw+br       , b.y   -br,
                   b.x+bw+br       , b.y+bh+br, "RIGHT");
  } else if (ball.dx > 0) {
    pt = intercept(ball.x          , ball.y, 
                   ball.x + ball.dx, ball.y + ball.dy,
                   b.x-br          , b.y   -br,
                   b.x-br          , b.y+bh+br, "LEFT");
  }
  if(!pt) {
    if(ball.dy < 0) {
      pt = intercept(ball.x          , ball.y, 
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x   -br       , b.y+bh+br,
                     b.x+bw+br       , b.y+bh+br, "BOTTOM");
    } else if(ball.dy > 0) {
      pt = intercept(ball.x          , ball.y, 
                     ball.x + ball.dx, ball.y + ball.dy,
                     b.x   -br       , b.y-br,
                     b.x+bw+br       , b.y-br, "TOP");
    }
  }
  return pt;
}

function keyPressed() {
  if(keyCode == ENTER) paused = !paused;
  if(keyCode == UP_ARROW) {
   balls.forEach(function(b){
     if(!b.moving) b.launch();
   }); 
  }
  if(menu && keyCode == RIGHT_ARROW) {
    menu = false;
    nextRound();
  }
  if(paused && keyCode == LEFT_ARROW) {
    paused = false;
      balls = [];
  balls.push(new Ball());
  paddle = new Paddle();
  powerUps = [];
  clearCourt();
    clearPowerUps();
    thisRound = 0;
    menu = true;
  }
  if(!paused && keyCode == DOWN_ARROW) {
    paddle.shoot();
  }
}

function loadLevel(level) {
  balls = [];
  balls.push(new Ball());
  paddle = new Paddle();
  powerUps = [];
  clearCourt();
  lasers = [];
  clearPowerUps();
  
  for(var y = 0; y < rows-8; y++) {
    for(var x = 0; x < cols; x++) {
      if(level[y][x] !== 0) bricks.push(new Brick(x, y, level[y][x]));
    }
  }
  
  var str = "ROUND\t" + thisRound + "\nPLAYER READY"
  showMessage(str, 150);
  
  start_sound.play();
}

function clearCourt() {
  bricks = [];
}

function checkCourtEmpty() {
  result = true;
  bricks.forEach(function(b){
    if(b.type !== 1) result = false;
  });
  return result;
}

function showMessage(str, time) {
  background(0);
  drawCourt();
  
  stop = true;
  fCounter = -time;
  
  stroke(255);
  fill(255);
  textSize(25);
  textFont(retroFont);
  textAlign(CENTER);
  text(str, pl, ptop+wt+(2*bh)+100, cw, (ch/2));
  
  showHighScore();
  showScore();
  showLives();
  showRound();
}

function PowerUp(x, y) {
  this.type;
  this.x = x;
  this.y = y;
  
  // types
  // 1 => extra life
  // 2 => tripe ball
  // 3 => grow paddle
  // 4 => magnet paddle
  // 5 => laser paddle
  // 6 => ball Shower
  
  var r = random();
  if(r < 0.1){
    this.type = 1;
  }
    
  else if(r < 0.20) {
    this.type = 6;
  }
      
  else if(r < 0.40) {
    this.type = 2;
  }
      
  else if(r < 0.60) {
    this.type = 3;
  }
      
  else if(r < .80){
    this.type = 4;
  } else {
    this.type = 5;
  }

  this.show = function() {

    switch(this.type) {
      case 1: image(extra_power, this.x, this.y, bw, bh); break;
      case 2: image(triple_power, this.x, this.y, bw, bh); break;
      case 3: image(grow_power, this.x, this.y, bw, bh); break;
      case 4: image(magnet_power, this.x, this.y, bw, bh);break;
      case 5: image(laser_power, this.x, this.y, bw, bh); break;
      case 6: image(shower_power, this.x, this.y, bw, bh);break;
    }
  }
  
  this.update = function() {
    this.y += 1;
  }
  
  this.hitPaddle = function() {
    if(this.y+bh > paddle.y &&
       this.y < paddle.y+ph &&
       this.x > paddle.x-bw &&
       this.x < paddle.x+pw) {
      
      switch(this.type) {
        case 1: lives++; extra_sound.play(); break;
        case 2: balls[0].triplicate(); break;
        case 3: 
          clearPowerUps();
          paddle.grow();
          break;
        case 4: 
          clearPowerUps();
          balls.forEach(function(b){
            b.magnetize();
          });
          break;
        case 5:
          clearPowerUps();
          paddle.beginLaser();
          break;
        case 6: balls[0].ballShower(); break;
      }
      
      //play() powerup
      return true;
    }
    return false;
  }
  
  
}

function showScore() {
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(25);
  textFont(retroFont);
  textAlign(LEFT);
  text("1UP", w-pr+pl, ptop+wt+(2*bh)+100, pr, (ch/2));
  stroke(255);
  fill(255);
  text(score, w-pr+pl, ptop+wt+(2*bh)+125, pr, (ch/2));
}

function showHighScore() {
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(25);
  textFont(retroFont);
  textAlign(LEFT);
  text("HIGH", w-pr+pl, ptop+wt+(2*bh), pr, (ch/2));
  text("SCORE", w-pr+pl, ptop+wt+(2*bh)+25, pr, (ch/2));
  stroke(255);
  fill(255);
  text(highScore, w-pr+pl, ptop+wt+(2*bh)+50, pr, (ch/2));
}

function showLives() {
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(25);
  textFont(retroFont);
  textAlign(LEFT);
  text("LIVES", w-pr+pl, ptop+wt+(2*bh)+175, pr, (ch/2));
  stroke(255);
  fill(255);
  text(lives, w-pr+pl, ptop+wt+(2*bh)+200, pr, (ch/2));
}

function showRound() {
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(25);
  textFont(retroFont);
  textAlign(LEFT);
  text("ROUND", w-pr+pl, ptop+wt+(2*bh)+300, pr, (ch/2));

  stroke(255);
  fill(255);
  text(thisRound, w-pr+pl, ptop+wt+(2*bh)+325, pr, (ch/2));
}

function updateScore(b) {
  var s = 0;
  switch(b.type) {
    case 1: break;
    case 2: s = 50*thisRound; break;
    case 3: s = 90; break;
    case 4: s = 80; break;
    case 5: s = 100; break;
    case 6: s = 110 ;break;
    case 7: s = 120 ;break;
    case 8: s = 70 ;break;
    case 9: s = 60; break;
    case 10: s = 50; break;
  }
  score += s;
  if(score > highScore) highScore = score;
}

function nextRound() {
  thisRound++;
  if(thisRound > 10) thisRound = 1;
  switch(thisRound) {
    case  1: loadLevel(round_1);  break;
    case  2: loadLevel(round_2);  break;
    case  3: loadLevel(round_3);  break;
    case  4: loadLevel(round_4);  break;
    case  5: loadLevel(round_5);  break;
    case  6: loadLevel(round_6);  break;
    case  7: loadLevel(round_7);  break;
    case  8: loadLevel(round_8);  break;
    case  9: loadLevel(round_9);  break;
    case 10: loadLevel(round_10); break;
  }
}

function showPauseScreen() {
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(25);
  textFont(retroFont);
  textAlign(LEFT);
  text("PAUSED", w-pr+pl, ptop+wt+(2*bh)+250, pr, (ch/2));
}

function showMenu() {
 background(0);
  drawCourt();

  stroke(255);
  fill(255);
  textSize(30);
  textStyle(BOLD);
  textFont(retroFont);
  textAlign(CENTER);
  text("ARKANOID", pl+wl, ptop+wt+(2*bh), cw-wl-wr, (ch/2));
  
  stroke(188, 25, 0);
  fill(188, 25, 0);
  textSize(18);
  text("PRESS 'ENTER' TO START GAME", pl+wl, ptop+wt+(2*bh)+100, cw-wl-wr, (ch/2));
  
  stroke(255);
  fill(255);
  textSize(18);
  text("by aruvham", pl+wl, ptop+wt+(2*bh)+25, cw-wl-wr, (ch/2)); 

  
  showHighScore();
  showScore();
  showLives();
  showRound();
  
  textSize(18);
  text("POWERUPS : ", pl+wl+wl, h-(14*bh));
  textSize(18);
  image(extra_power, pl+wl+wl, h-(3*bh), bw, bh);
  text("EXTRA LIFE", pl+wl+wl+wl+bw, h-(2*bh));
  image(triple_power, pl+wl+wl, h-(5*bh), bw, bh);
  text("TRIPLE", pl+wl+wl+wl+bw, h-(4*bh));
  image(grow_power, pl+wl+wl, h-(7*bh), bw, bh);
  text("EXPAND", pl+wl+wl+wl+bw, h-(6*bh));
  image(magnet_power, pl+wl+wl, h-(9*bh), bw, bh);
  text("CATCH", pl+wl+wl+wl+bw, h-(8*bh));
  image(laser_power, pl+wl+wl, h-(11*bh), bw, bh);
  text("LASER", pl+wl+wl+wl+bw, h-(10*bh));
  image(shower_power, pl+wl+wl, h-(13*bh), bw, bh);
  text("BALL SHOWER", pl+wl+wl+wl+bw, h-(12*bh));
  
  text("CONTROLLLLS : ", pl+wl+(cw/2), h-(14*bh));
  text("MOVE : 'A', 'D'", pl+wl+(cw/2), h-(12*bh));
  text("SHOOT BALL : 'W'", pl+wl+(cw/2), h-(10*bh));
  text("SHOOT LASER : 'S'", pl+wl+(cw/2), h-(8*bh));
  text("PAUSE : 'ENTER'", pl+wl+(cw/2), h-(6*bh));
  text("QUIT : 'Q'", pl+wl+(cw/2), h-(4*bh));
  text("CHOOSE ROUND : 'R'", pl+wl+(cw/2), h-(2*bh));

}

function gameOver() {
  menu = true;
  paused = false;
  score = 0;
  thisRound = 0;
  lives = 3;
  
  balls = [];
  lasers = [];
  balls.push(new Ball());
  paddle = new Paddle();
  powerUps = [];
  clearCourt();
  
  showMessage("GAME OVER", 120);
}

function clearPowerUps() {
  paddle.shrink();
  paddle.endLaser();
  lasers = [];
  balls.forEach(function(b){
    if(b.magnet) {
          b.demagnetize();
          b.moving = true;
          b.launch();
    }

  });
}

function Laser(x, y) {
  this.x = x;
  this.y = y;
  
  this.show = function(){
    /*noStroke();
    fill(255, 0,0 );
    rect(this.x, this.y, 5, 10);*/
    
    image(laser_sprite, this.x, this.y, 5, 10);
  }
  
  this.update = function() {
    this.y -= 5;
  }
  
  this.hitBrick = function(b) {
    if(this.y < b.y +bh && 
       this.x < b.x+bw &&
       this.x+5 > b.x) {
      //debugger;
      return true;
    }
    return false;
  }
}
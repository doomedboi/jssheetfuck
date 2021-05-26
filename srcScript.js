var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
function DetectMobile() {
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    return true;
  }else{
    return false;
  }
}

var ModWind = document.querySelector('#ModalWind');
var startBtn = document.querySelector('#startGameBtn');

cvs.width = innerWidth;
cvs.height = innerHeight;
// load images

var bird = new Image();
var bg = new Image();
var fg = new Image();
var kurt = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
kurt.src = "images/kurt.png";

class Entity {
    constructor(x, y, sprite, hitbox){
        this.x = x
        this.y = y
        this.sprite = sprite
        this.hitbox = hitbox; // circle by default
    }

    getHitboxCoorX() {
        return  this.x + 20;
    }
    getHitboxCoorY() {
        return this.y + 10;
    }
    draw(){
        ctx.drawImage(this.sprite, this.x, this.y);
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(this.getHitboxCoorX(),this.getHitboxCoorY(), this.hitbox, 0, Math.PI * 2, true);
        ctx.fill();
    }

}

class Player extends Entity {
    constructor(x, y, sprite, hp, side, velocity, hitbox) {
        super(x, y, sprite);
        this.hp = hp;
        this.side = side;
        this.velocity = velocity;
        this.hitbox = hitbox;
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        
    }
}

class Projectile extends Entity {
    constructor(x, y, sprite, velocity, hitbox) {
        super(x, y, sprite);
        this.velocity = velocity;
        this.hitbox = hitbox;
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        //ctx.beginPath();
        //ctx.arc(this.getHitboxCoorX(),this.getHitboxCoorY(), this.hitbox, 0, Math.PI * 2, true);
        //  ctx.fill();
    }
} 

class Blood extends Projectile {
    constructor(x, y, velocity, hitbox) {
        super(x, y, null, velocity, hitbox);
        this.alpha = 2;
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(this.getHitboxCoorX(),this.getHitboxCoorY(), this.hitbox, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    }
}

var player = new Player(cvs.width / 2, cvs.height / 2, bird,
    228, 1, null, 15);
// some variables

var gap = 85;
var constant;

var bX = 10;
var bY = 150;

var gravity = 1.5;

var score = 0;

// audio files

var fly = new Audio();
var scor = new Audio();

fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";


// on key down
function keyDownHandler(e) {
    
    if (e.code == 'ArrowRight') {
        player.x += 20;
    }
    else if (e.code == 'ArrowLeft'){
        player.x -= 20;
    }
    
}


function moveUp(){
    bY -= 25;
    fly.play();
}

// pipe coordinates

var pipe = [];

var Projectiles = [];
var Bloods = [];
var enemies = [];
pipe[0] = {
    x : cvs.width,
    y : 0
};

function spawnEntities() {
    setInterval(() => {
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - 20 :  cvs.width + 30;
            y = Math.random() < 0.5 ? 0 - 20:  cvs.height + 30;
        } else {
            x = Math.random() * cvs.width;
            y = Math.random() < 0.5 ? 0 - 20 : cvs.height + 30;
        }

        const angle = Math.atan2(player.y - y, 
            player.x - x);

        const velocity = {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }
        
        enemies.push( new Player (x, y, bird, 228, 1, velocity, 15));
    }, 1000);
}

let animationID;

function draw(){
    animationID = requestAnimationFrame(draw);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    Bloods.forEach((blood, idx) => {
        if (blood.alpha <= 0) {
            Bloods.splice(idx, 1);
        } else {
            blood.update();
        }
    });

    player.draw();
    console.log(player.x, player.y);
    //console.log(enemies);
    Projectiles.forEach((proj, idx) => {
        proj.update();
        if (proj.x - proj.hitbox < 0 || proj.getHitboxCoorX() > cvs.width
            || proj.getHitboxCoorY() < 0 || proj.getHitboxCoorY() > cvs.height) {
            setTimeout( ()=> {
                Projectiles.splice(idx, 1);
            }, 0)
        }
    });
    //console.log(Projectiles);
    enemies.forEach((en, enemies_idx) => {
        if (en.x > 2500 || en.x < -300 || en.y > 2500 || en.y < -300)
            enemies.splice(enemies_idx, 1);
        
        en.update(1, 1);
        const dist = Math.hypot(player.getHitboxCoorX() - en.getHitboxCoorX(),
        player.getHitboxCoorY() - en.getHitboxCoorY());
        console.log(dist);
        //handle end game
        if (dist < 30) {
            cancelAnimationFrame(animationID);
        }
        Projectiles.forEach((projectile, projectl_idx) => {
            //distance between
            const dist = Math.hypot(projectile.getHitboxCoorX() - en.getHitboxCoorX(),
                projectile.getHitboxCoorY() - en.getHitboxCoorY());
            
            // handle touch
            if (dist - en.hitbox - projectile.hitbox < 2) {
                for (let i = 0; i < 5; i++) {
                     Bloods.push (
                         new Blood(projectile.x, projectile. y,
                            {
                                x: Math.random() - 0.5,
                                y: Math.random() - 0.5
                            }, 3)
                     );        
                }

                //no flash effect
                console.log("touch happen");
                setTimeout(() => {
                    enemies.splice(enemies_idx, 1);
                    Projectiles.splice(projectl_idx, 1);
                }, 0)
            }
        })
    });
    
    ctx.fillStyle = "steelblue";
    ctx.font = "20px Verdana";
    ctx.fillText("Score : "+ score, 10, 30);
}







function HndTouch(event) {
    
}
var clientX, clientY;
var tchX, tchY;
var xDown = null;                                                        
var yDown = null;
function Init() {
    let devTouch;
    if (DetectMobile() == true) 
        devTouch = "touchstart";
    else {
        devTouch = "click"
    }
    if ( DetectMobile() ) {
        console.log("touches");
        cvs.addEventListener("touchstart", (e) => {
            tchX = e.touches[0].clientX;
            tchY = e.touches[0].clientY;
            let angle = Math.atan2(
                tchY - player.y,
                tchX - player.x
            );
    
    Projectiles.push(new Projectile(player.x,
        player.y, bird, 
        {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }, 15 ));
        }, false );

        cvs.addEventListener('touchend', function(e) {
            var deltaX, deltaY;
          
            // Compute the change in X and Y coordinates.
            // The first touch point in the changedTouches
            // list is the touch point that was just removed from the surface.
            deltaX = e.changedTouches[0].clientX - clientX;
            deltaY = e.changedTouches[0].clientY - clientY;
            // Process the data ...
            
          }, false);

        cvs.addEventListener('touchmove', (event)=> {
            var xUp = evt.touches[0].clientX;                                    
            var yUp = evt.touches[0].clientY;

            var xDiff = tchX - xUp;
            var yDiff = tchY - yUp;

            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff > 0 ) {
                    console.log("change x");
                    player.x -= 20; 
                } else {
                    player.x += 20;
                }                       
            } else {
                if ( yDiff > 0 ) {
                    player.y += 20;
                } else { 
                    player.y -= 20;
                }                                                                 
            }
            /* reset values */
            xDown = null;
            yDown = null;     
        } , false);
        
        startBtn.addEventListener(devTouch, () =>  {
            ModWind.style.display = 'none';
            draw();
            spawnEntities();
        });
        
    } else {
        console.log("mouse");
        //manip our pl
        document.addEventListener("keydown", keyDownHandler, false );
        //for projectls
        document.addEventListener('click', (event) => {
            let angle = Math.atan2(
                event.clientY - player.y,
                event.clientX - player.x
            );
    
    Projectiles.push(new Projectile(player.x,
        player.y, bird, 
        {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }, 15 )); 
    });
    
    
    }
    startBtn.addEventListener(devTouch, () => {
        ModWind.style.display = 'none';
        setTimeout( ()=> {
            draw();
            spawnEntities();
        }, 500);
        
            
    })
    
}

Init();
var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
function DetectMobile() {
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    return true;
  }else{
    return false;
  }
}

var score_for_boss = 66;
var ModWind = document.querySelector('#ModalWind');
var startBtn = document.querySelector('#startGameBtn');
var endGameSc = document.querySelector('#endScoreUI');

var GAME_START = false;

cvs.width = innerWidth;
cvs.height = innerHeight - 5;
// load images

var obstacles = [];

/* SETUP SPRITES */
var bird = new Image();
var bird_enemy = new Image();
var bird_hurted = new Image();
var bird_boss = new Image();
var bomb1 = new Image();
var bomb_obst = new Image();

bird.src = "images/bird.png";
bird_enemy.src = "images/bird_enemy.png";
bird_hurted.src = "images/bird_hurted.png";
bird_boss.src = "images/bird_boss.png";
bomb1.src = "images/bomb1.png";
bomb_obst.src = "images/bomb_obst.png";

/* SETUP AUDIO */
var pew = new Audio();
var bgS = new Audio();
var touch = new Audio();
var damageS = new Audio();
var boss_music = new Audio();

pew.src = "sounds/pewpew.mp3";
bgS.src = "sounds/back.mp3";
touch.src = "sounds/touch.mp3";
damageS.src = "sounds/damage.mp3";
boss_music.src = "sounds/boss_music.mp3";

/* END SETUP AUDIO */

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
        /*draw hitbox */
        //ctx.beginPath();
        //ctx.fillStyle = 'red';
        //ctx.arc(this.getHitboxCoorX(),this.getHitboxCoorY(), this.hitbox, 0, Math.PI * 2, true);
        //ctx.fill();
    }

    IncCoordBy(x, y) {
        this.x += x;
        this.y += y;
        if (this.x < 0) {
            this.x += 30;
        } else if (this.x >= cvs.width) {
            this.x -= 30;
        } else if (this.y < 0) {
            this.y += 30;
        } else if (this.y >= cvs.height) {
            this.y -= 30;
        }
    }

}


var bird_b;

class Player extends Entity {
    constructor(x, y, sprite, hp, damage, side, velocity, hitbox) {
        super(x, y, sprite);
        this.hp = hp;
        this.damage = damage;
        this.side = side;
        this.velocity = velocity;
        this.hitbox = hitbox;
    }

    Hurt (damage) {
        this.hp -= damage;
        }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class ClientPlayer extends Player {
    constructor(x, y, sprite, hp, damage, side, velocity, hitbox) {
        super(x, y, sprite);
        this.hp = hp;
        this.damage = damage;
        this.side = side;
        this.velocity = velocity;
        this.hitbox = hitbox;
        this.godmode = false;
    }

    Hurt(damage) {
        if (this.godmode == true) {
            return;
        } else {
            this.godmode = true;
            this.sprite = bird_hurted;
            setTimeout( ()=> {
                this.godmode = false;
                this.hp -= damage;
                this.sprite = bird;
            }, 3000);
            
        }
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
    }
} 

class Obstacle extends Entity {
    constructor(x, y, sprite, hitbox) {
        super(x, y, sprite, hitbox);
        this.xyz = 1;
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

var player = new ClientPlayer(cvs.width / 2, cvs.height / 2, bird,
    3, 40, 1, null, 15);

var score = 0;
var best_score = 0;

// on key down
function keyDownHandler(e) {
    let x = 0; let y = 0;
    if (e.code == 'ArrowRight') {
        x = 3;
    }
    if (e.code == 'ArrowLeft'){
        x = -3;
    }
    if (e.code == 'ArrowUp'){
        y = -3;
    }
    if (e.code == 'ArrowDown') {
        y = 3;
    }

    player.IncCoordBy(x, y);
    
}

var IsBossDraw = false;

function moveUp(){
    bY -= 25;
    fly.play();
}

var Projectiles = [];
var Bloods = [];
var enemies = [];

var boss_time = false;

function spawnBoss() {
    boss_time = true;
    boss_music.play();
    for (let index = 0; index < 30; index++) {
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - 25 :  cvs.width + 30;
            y = Math.random() < 0.5 ? 0 - 25:  cvs.height + 30;
        } else {
            x = Math.random() * cvs.width;
            y = Math.random() < 0.5 ? 0 - 30 : cvs.height + 30;
        }

        const angle = Math.atan2(player.y - y, 
            player.x - x);

        const velocity = {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }
        
        enemies.push( new Player (x, y, bird_boss, 100, 50, 1, velocity, 15));
    }
}
function spawnEntities(spr, hp, interval) {
    setInterval(() => {
        if (enemies.length > 20) {
            return;
        }
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
        
        enemies.push( new Player (x, y, spr, hp, 1, 1, velocity, 15));
    }, interval);
}

let animationID;

var invisForGM = false;
var IsBossSpawned = false;
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
    
    Projectiles.forEach((proj, idx) => {
        proj.update();
        if (proj.x - proj.hitbox < 0 || proj.getHitboxCoorX() > cvs.width
            || proj.getHitboxCoorY() < 0 || proj.getHitboxCoorY() > cvs.height) {
            setTimeout( ()=> {
                Projectiles.splice(idx, 1);
            }, 0)
        }
    });

    obstacles.forEach( (obst, idx) => {
        obst.draw();
        const dist = Math.hypot(player.getHitboxCoorX() - obst.getHitboxCoorX(),
        player.getHitboxCoorY() - obst.getHitboxCoorY());
        if (dist < 30) {
            player.Hurt(1);
            obstacles.splice(idx, 1);
        }
    });
    
    enemies.forEach((en, enemies_idx) => {
        if (en.x > 2500 || en.x < -300 || en.y > 2500 || en.y < -300)
            enemies.splice(enemies_idx, 1);
        
        en.update(1, 1);
        const dist = Math.hypot(player.getHitboxCoorX() - en.getHitboxCoorX(),
        player.getHitboxCoorY() - en.getHitboxCoorY());
        
        //handle end game
        if (dist < 30) {
            touch.play();
            //ENABLE GOD-MODE FOR 3 sec
            if (player.hp > 1 && player.godmode != true) {
                console.log("GM ENABLED");
               player.Hurt(en.damage);
            } else if (player.hp <= 1) {
                player.Hurt(en.damage);
                cancelAnimationFrame(animationID);
                endGameSc.innerHTML = score;
                ModWind.style.display = 'flex';
                GAME_START = false;
                
            }
        }
        if (player.hp < 0 ) {
                player.Hurt(en.damage);
                cancelAnimationFrame(animationID);
                endGameSc.innerHTML = score;
                ModWind.style.display = 'flex';
                GAME_START = false;
                
        }
        Projectiles.forEach((projectile, projectl_idx) => {
            //distance between
            const dist = Math.hypot(projectile.getHitboxCoorX() - en.getHitboxCoorX(),
                projectile.getHitboxCoorY() - en.getHitboxCoorY());
            
            // handle touch
            if (dist - en.hitbox - projectile.hitbox < 2) {
                damageS.play();
                for (let i = 0; i < 5; i++) {
                     Bloods.push (
                         new Blood(projectile.x, projectile. y,
                            {
                                x: Math.random() - 0.5,
                                y: Math.random() - 0.5
                            }, 3)
                     );        
                }
                
                score += en.hp / 10;
                console.log(score);
                en.hp -= player.damage;
                Projectiles.splice(projectl_idx, 1);
                //no flash effect
                console.log("touch happen");
                if (en.hp > 0) {
                    return;
                }
                setTimeout(() => {
                    enemies.splice(enemies_idx, 1);
                    Projectiles.splice(projectl_idx, 1);
                }, 0)
            }
        })
    });
    
    if (score > best_score) {
        best_score = score;
    }
    
    if (score >= score_for_boss && IsBossSpawned != true) {
        IsBossSpawned = true;
        setTimeout( ()=> {
            spawnBoss();
            bgS.pause();
            console.log("BOSS TIME");
        }, 1000);
    }
    
    ctx.fillStyle = "steelblue";
    ctx.font = "20px Verdana";
    ctx.fillText("Score: "+ score, 10, 30);
    ctx.fillText("Best score: " + best_score,  cvs.width - 170 , 30);
    ctx.fillText("HP: " + player.hp, 10, 50);
    //console.log(GAME_START);
}

var clientX, clientY;
var tchX, tchY;
var xDown = null;                                                        
var yDown = null;

function Init() {
    for (let index = 0; index < Math.random() * 4; index++) {
        obstacles.push( new Obstacle(Math.random() * 300,Math.random()*  300, bomb_obst, 50));
    }
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
            
        }, false );

        cvs.addEventListener('touchend', function(e) {
            var deltaX, deltaY;
          
            // Compute the change in X and Y coordinates.
            // The first touch point in the changedTouches
            // list is the touch point that was just removed from the surface.
            deltaX = e.changedTouches[0].clientX - tchX;
            deltaY = e.changedTouches[0].clientY - tchY;
            if (deltaX != 0 && deltaY != 0) {
                return;
            }
            // shoot
            if (GAME_START != true) {
                return;
            }
            let angle = Math.atan2(
                tchY - player.y,
                tchX - player.x
            );
    
    Projectiles.push(new Projectile(player.x,
        player.y, bomb1, 
        {
            x : Math.cos(angle) * 3,
            y : Math.sin(angle) * 3
        }, 10 ));
        pew.play();
            
          }, false);

        cvs.addEventListener('touchmove', (evt)=> {
            var xUp = evt.touches[0].clientX;                                    
            var yUp = evt.touches[0].clientY;

            var xDiff = tchX - xUp;
            var yDiff = tchY - yUp;
            player.IncCoordBy((-1) * xDiff % 2, (-1) * yDiff % 2);
            //player.x += (-1) * xDiff % 2;
            //player.y += (-1) * yDiff % 2;  
        } , false);
        
        
        
    } else {
        console.log("mouse");
        //manip our pl
        document.addEventListener("keydown", keyDownHandler, false );
        //for projectls
        document.addEventListener('click', (event) => {
            if (GAME_START != true) {
                return;
            }
            let angle = Math.atan2(
                event.clientY - player.y,
                event.clientX - player.x
            );
    
    Projectiles.push(new Projectile(player.x,
        player.y, bomb1, 
        {
            x : Math.cos(angle) * 3,
            y : Math.sin(angle) * 3
        }, 15 )); 
    pew.play();
    });
    
    
    }
    startBtn.addEventListener(devTouch, () =>  {
        bgS.play();
        console.log('start');
        enemies.splice(0, enemies.length);
        Projectiles.splice(0, Projectiles.length);
        player.hp = 3;
        ModWind.style.display = 'none';
        IsBossSpawned = false;
        score = 0;
        boss_music.pause();
        setTimeout( () => {player.hp = 3}, 2000);
        setTimeout( ()=> {
            draw();
            player.x = cvs.width / 2;
            player.y = cvs.height / 2;
            spawnEntities(bird_enemy, 50, 1000);
            GAME_START = true;
            IsBossSpawned = false;
            boss_time = false;
        }, 50);
        
    });
    
}

Init();


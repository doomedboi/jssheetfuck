var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images

var bird = new Image();
var bg = new Image();
var fg = new Image();


bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";



class Entity {
    constructor(x, y, sprite){
        this.x = x
        this.y = y
        this.sprite = sprite
    }

    draw(){
        ctx.drawImage(this.sprite, this.x, this.y)
    }

}

class Player extends Entity {
    constructor(x, y, sprite, hp, side, velocity) {
        super(x, y, sprite);
        this.hp = hp;
        this.side = side;
        this.velocity = velocity;
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Projectile extends Entity {
    constructor(x, y, sprite, velocity) {
        super(x, y, sprite);
        this.velocity = velocity;
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
} 
 
var player = new Entity(100, 100, bird)
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

const proj1 = new Projectile(cvs.width / 2,
    cvs.height / 2,
    bird,
    {
        x : 1,
        y : 1
    }
    );
// on key down

document.addEventListener("keydown",moveUp);
document.addEventListener('click', (event) => {
    let angle = Math.atan2(
        event.clientY - cvs.height / 2,
        event.clientX - cvs.width / 2
    );
    Projectiles.push(new Projectile(cvs.width / 2,
        cvs.height / 2, bird, 
        {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }));
});

function moveUp(){
    bY -= 25;
    fly.play();
}

// pipe coordinates

var pipe = [];

var Projectiles = [];
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

        const angle = Math.atan2(cvs.height / 2 - y, 
            cvs.width / 2 - x);

        const velocity = {
            x : Math.cos(angle),
            y : Math.sin(angle)
        }
        
        enemies.push( new Player (x, y, bird, 228, 1, velocity));
    }, 1000);
}

function draw(){
    
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    //ctx.drawImage(bg,0,0);
    
    
    player.draw();
    
        
        
    

    ctx.drawImage(fg,0,cvs.height - fg.height);
    
    ctx.drawImage(bird,bX,bY);
    
    Projectiles.forEach((proj) => {
        proj.update();
    });

    enemies.forEach((en) => {
        en.update(1, 1) ;
    });
    
    ctx.fillStyle = "#000";
    ctx.font = "20px Verdana";
    ctx.fillText("Score : "+score,10,cvs.height-20);
    
    requestAnimationFrame(draw);
    
}



draw();
spawnEntities();

























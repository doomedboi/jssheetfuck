let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d"); //like D3Ddev
//#region ball 
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -3;
let ball_radius = 10;
//#endregion
function draw_Pad() {
    ctx.beginPath();
    ctx.rect(padX, canvas.height - padH, padW, padH);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw_Ball()
{
    ctx.beginPath();
    ctx.arc(x, y, ball_radius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw()
{
    ctx.clearRect(0,0,canvas.width, canvas.height);
    draw_Ball();
    if(x + dx > canvas.width-ball_radius || x + dx < ball_radius) {
        dx = -dx;
    }
    if(y + dy > canvas.height-ball_radius || y + dy < ball_radius) {
        dy = -dy;
    }
    x += dx;
    y += dy;
}
setInterval(draw, 10); //every 10 mls

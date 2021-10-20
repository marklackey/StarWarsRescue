const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasMax = canvas.width > canvas.height ? canvas.width : canvas.height;

let frame = 0;
let score = 1000 * 1000;

const upButton = document.getElementById("up");
const downButton = document.getElementById("down");
const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

console.log(upButton.style.left)

const NUM_PUMPKINS = 20;
const SQRT_2 = Math.sqrt(2);

let GAME_OVER = false;

const keys = [];
const spriteWidth = 50;
const spriteHeight = 48;
const imageWidth = spriteWidth * canvas.width / 800;
const imageHeight = spriteHeight * canvas.height / 500;
const player = {
    x: Math.random() * (canvas.width - imageWidth),
    y: Math.random() * (canvas.height - imageHeight),
    width: spriteWidth,
    height: spriteHeight,
    frameX: 0,
    frameY: 0,
    speed: 9,
    moving: false
};

class Pumpkin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameX = Math.floor(5 * Math.random());
        this.frameY = 1;
        this.width = 124;
        this.height = 118;
        this.speed = 7;
        this.direction = 1;
    }
}

const pumpkins = [];
let count = 0;
for (let i = 0; i < NUM_PUMPKINS; i++) {
    // pumpkins[i] = new Pumpkin(Math.random() * (canvas.width - player.width), Math.random() * (canvas.height - player.height));
    let collision = true;
    while (collision) {
        pumpkins[i] = new Pumpkin(Math.random() * (canvas.width - imageWidth), Math.random() * (canvas.height - imageHeight));
        collision = false;
        for (let j = 0; j < i; j++) {
            if (handlePumpkinCollision(pumpkins[i], pumpkins[j]) || handlePumpkinCollision(pumpkins[i], player)) {
                collision = true;
                break;
            }
        }
    }
}

function handlePumpkinCollision(p1, p2) {
    return (((p1.x + player.width) > p2.x && p1.x < (p2.x + imageWidth)) &&
        ((p1.y + player.height) > p2.y && p1.y < (p2.y + imageHeight)));
}

const playerSprite = new Image();
playerSprite.src = "assets/death_scythe.png"; /* check out this character and more at http://untamed.wild-refuge.net/rmxpresources.php?characters */
const background = new Image();
background.src = "assets/danger-halloween-image-scary-halloween-background.jpg";
const pumpkinImg = new Image();
pumpkinImg.src = "assets/pumpkin.png";

function drawPlayerSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

function drawPumpkinSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

function handlePlayerFrame() {
    if (player.frameX < 3 && player.moving) player.frameX++;
    else player.frameX = 0;
}

function handlePumpkinFrame(pumpkin) {
    if (frame % 3 === 0) {
        if (pumpkin.direction === -1) {
            if (pumpkin.frameX < 5) pumpkin.frameX++;
            else pumpkin.frameX = 0;
        } else {
            if (pumpkin.frameX > 0) pumpkin.frameX--;
            else pumpkin.frameX = 5;
        }
    }
    if (pumpkin.x > (canvas.width - imageWidth) || pumpkin.x <= 0) {
        pumpkin.direction *= -1;
    }
    pumpkin.x += pumpkin.direction * pumpkin.speed;
}

let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function drawPumpkins() {
    let count = 0;
    for (var i = 0; i < NUM_PUMPKINS; i++) {
        let pumpkin = pumpkins[i];
        if (pumpkin != null) {
            if (handlePumpkinCollision(player, pumpkin)) {
                pumpkins[i] = null;
            }
            drawPumpkinSprite(pumpkinImg, pumpkin.width * pumpkin.frameX, pumpkin.height * pumpkin.frameY, pumpkin.width, pumpkin.height,
                pumpkin.x, pumpkin.y, imageWidth, imageHeight);
            handlePumpkinFrame(pumpkin);
        } else {
            count++;
            if (count == NUM_PUMPKINS) {
                // console.log("over");
                GAME_OVER = true;
            }
        }
    }
}

function animate() {
    if (!GAME_OVER) {
        requestAnimationFrame(animate);
    }
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawPumpkins();
        drawPlayerSprite(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.x, player.y,
            imageWidth, imageHeight);
        movePlayer();
        handlePlayerFrame();
        frame++;
        score -= 100;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        document.getElementById("score").innerHTML = "Score: " + score;
        if (GAME_OVER || score <= 0) {
            document.getElementById("score").innerHTML = "";
            ctx.fillStyle = 'orange';
            ctx.font = '20vmin Creepster';
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
            ctx.font = '8vmin Creepster';
            ctx.fillText("Score: " + +(score > 0 ? score : 0), canvas.width / 2, canvas.height * .65);
        }
    }

}

window.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    player.moving = true;
});

window.addEventListener("keyup", function(e) {
    delete keys[e.keyCode];
    player.moving = false;
});

function movePlayer() {
    let playerSpeed = player.speed;
    if ((keys[38] && keys[37]) || (keys[38] && keys[39]) || (keys[40] && keys[37]) || (keys[40] && keys[39])) {
        playerSpeed = playerSpeed / SQRT_2;
    }
    if (keys[38] && player.y > 0) {
        player.y -= playerSpeed;
        player.frameY = 3;
        player.moving = true;
    }
    if (keys[37] && player.x > 0) {
        player.x -= playerSpeed;
        player.frameY = 1;
        player.moving = true;
        score -= 5000;
    }
    if (keys[40] && player.y < canvas.height - imageHeight) {
        player.y += playerSpeed;
        player.frameY = 0;
        player.moving = true;
    }
    if (keys[39] && player.x < canvas.width - imageWidth) {
        player.x += playerSpeed;
        player.frameY = 2;
        player.moving = true;
        score -= 5000;
    }
}

function stopUp(event) {
    keys[38] = false;
    player.moving = false;
    event.stopPropagation();
}

function doUp(event) {
    keys[38] = true;
    player.moving = true;
    event.stopPropagation();
}

upButton.addEventListener("touchstart", doUp);
upButton.addEventListener("mousedown", doUp);
upButton.addEventListener("mouseup", stopUp);
upButton.addEventListener("touchend", stopUp);

function stopDown(event) {
    keys[40] = false;
    player.moving = false;
    event.stopPropagation();
}

function doDown(event) {
    keys[40] = true;
    player.moving = true;
    event.stopPropagation();
}

downButton.addEventListener("touchstart", doDown);
downButton.addEventListener("mousedown", doDown);
downButton.addEventListener("mouseup", stopDown);
downButton.addEventListener("touchend", stopDown);

function stopLeft(event) {
    keys[37] = false;
    player.moving = false;
    event.stopPropagation();
}

function doLeft(event) {
    keys[37] = true;
    player.moving = true;
    event.stopPropagation();
}

leftButton.addEventListener("touchstart", doLeft);
leftButton.addEventListener("mousedown", doLeft);
leftButton.addEventListener("mouseup", stopLeft);
leftButton.addEventListener("touchend", stopLeft);

function stopRight(event) {
    keys[39] = false;
    player.moving = false;
    event.stopPropagation();
}

function doRight(event) {
    keys[39] = true;
    player.moving = true;
    event.stopPropagation();
}

rightButton.addEventListener("touchstart", doRight);
rightButton.addEventListener("mousedown", doRight);
rightButton.addEventListener("mouseup", stopRight);
rightButton.addEventListener("touchend", stopRight);


startAnimating(15);
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasMax = canvas.width > canvas.height ? canvas.width : canvas.height;

let frame = 0;
let score = 0;

let level = 1;

let NUM_PUMPKINS = 5;
const SQRT_2 = Math.sqrt(2);

let GAME_OVER = false;
let GAME_STARTED = false;

const keys = [];
const spriteWidth = 50;
const spriteHeight = 48;
let imageWidth = spriteWidth * canvas.width / 800;
let imageHeight = spriteHeight * canvas.height / 500;

const player = {
    x: Math.random() * (canvas.width - imageWidth),
    y: Math.random() * (canvas.height - imageHeight),
    width: spriteWidth,
    height: spriteHeight,
    frameX: 0,
    frameY: 0,
    speed: canvasMax / 100,
    moving: false
};

const smoke = {
    frameX: 0,
    frameY: 0,
}

class Pumpkin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameX = Math.floor(5 * Math.random());
        this.frameY = 1;
        this.width = 124;
        this.height = 118;
        this.speed = .5 * player.speed + .2 * Math.random() * player.speed;
        this.direction = 1;
    }
}

const pumpkins = [];

function makePumpkins() {
    for (let i = 0; i < NUM_PUMPKINS; i++) {
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
}

function handlePumpkinCollision(p1, p2) {
    return (((p1.x + imageWidth) > p2.x && p1.x < (p2.x + imageWidth)) &&
        ((p1.y + imageHeight) > p2.y && p1.y < (p2.y + imageHeight)));
}

function isDesktop() {
    return canvas.width > 600;
}

const playerSprite = new Image();
playerSprite.src = "assets/death_scythe.png"; /* check out this character and more at http://untamed.wild-refuge.net/rmxpresources.php?characters */
const background = new Image();
if (isDesktop()) {
    background.src = "assets/halloween-background.jpg";
} else {
    background.src = "assets/halloween-background-mobile.jpg";
    imageWidth = imageWidth * 1.5;
    imageHeight = imageHeight * 1.5;
}
const pumpkinImg = new Image();
pumpkinImg.src = "assets/pumpkin.png";
const smokeImg = new Image();
smokeImg.src = "assets/pngegg.png"

function drawPlayerSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(smokeImg, 256 * smoke.frameX, 256 * smoke.frameY, 256, 256, dX - .1 * dW, dY - .1 * dH, 1.2 * dW, 1.2 * dH)
    ctx.globalAlpha = .8;
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
    ctx.globalAlpha = 1;
}

function drawPumpkinSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

function handlePlayerFrame() {
    if (player.frameX < 3 && player.moving) player.frameX++;
    else player.frameX = 0;
}

function handleSmokeFrame() {
    if (frame % 2 === 0) {
        if (smoke.frameX == 3) {
            smoke.frameX = 0;
        } else { smoke.frameX++; }
        if (smoke.frameY == 3) {
            smoke.frameY = 0;
        } else {
            smoke.frameY++;
        }
    }
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
let count = 0;

function drawPumpkins() {
    count = 0;
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
                GAME_OVER = true;
                if (level < 6) {
                    GAME_STARTED = false;
                    if (score > 0) {
                        level++;
                    }
                }
            }
        }
    }
}

let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        if (!GAME_OVER && score > 0) {
            score -= 100;
        }
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (GAME_STARTED) {
            drawPumpkins();
            drawPlayerSprite(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.x, player.y,
                imageWidth, imageHeight);
            movePlayer();
            handlePlayerFrame();
            handleSmokeFrame();
            frame++;
            document.getElementById("score").innerHTML = "Score: " + score;
            if (GAME_OVER || score <= 0) {
                document.getElementById("score").innerHTML = "";
                ctx.fillStyle = 'orange';
                ctx.font = '15vmin Creepster';
                var gameOverText = level < 6 ? "Game Over" : "You Win!"
                ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2);
                ctx.font = '8vmin Creepster';
                ctx.fillText("Score: " + (score > 0 ? score : 0), canvas.width / 2, canvas.height * .65);
            }
        } else {
            document.getElementById("score").innerHTML = "";
            ctx.fillStyle = 'orange';
            ctx.font = '15vmin Creepster';
            ctx.fillText("Pumpkin Shuffle", canvas.width / 2, canvas.height / 2);
            ctx.font = '8vmin Creepster';

            var scoreText = "";
            if (score > 0) {
                scoreText = "Score: " + (score > 0 ? score : 0)
            }
            var text = " to Start Level " + level;
            if (isTouchDevice) {
                text = "Press a Button" + text;
            } else {
                text = "Press Space" + text;
            }
            if (score > 0) {
                ctx.fillText(scoreText, canvas.width / 2, canvas.height * .65);
                ctx.fillText(text, canvas.width / 2, canvas.height * .75);
            } else {
                ctx.fillText(text, canvas.width / 2, canvas.height * .65);
            }
        }
        if (isTouchDevice) {
            display.buffer.clearRect(0, 0, display.buffer.canvas.width, display.buffer.canvas.height);
            display.renderButtons(controller.buttons);
            display.render();
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
    if (keys[38] && player.y > 0) { // Up
        player.y -= playerSpeed;
        player.frameY = 3;
        player.moving = true;
        score -= 1000;
    }
    if (keys[37] && player.x > 0) { // Left
        player.x -= playerSpeed;
        player.frameY = 1;
        player.moving = true;
        score -= 2500;
    }
    if (keys[40] && player.y < canvas.height - imageHeight) { //Down
        player.y += playerSpeed;
        player.frameY = 0;
        player.moving = true;
        score -= 1000;
    }
    if (keys[39] && player.x < canvas.width - imageWidth) { // Right
        player.x += playerSpeed;
        player.frameY = 2;
        player.moving = true;
        score -= 2500;
    }
}
const LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40;

function moveOrStop(key, moving) {
    keys[key] = moving;
    player.moving = moving;
}

window.addEventListener("keyup", function(e) {
    if (!GAME_STARTED && e.code === "Space") {
        score += 1000 * 1000;
        NUM_PUMPKINS += 10;
        makePumpkins();
        GAME_STARTED = true;
        GAME_OVER = false;
    }
});

startAnimating(15);
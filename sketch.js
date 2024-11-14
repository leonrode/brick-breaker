const SIZE = 1000;
const WIDTH = 1408;
const HEIGHT = 800;

const PLATFORM_WIDTH = 200;
const PLATFORM_HEIGHT = 60;

const PLATFORM_SPEED = 10;

let platformX = WIDTH / 2 - PLATFORM_WIDTH / 2;
let platformY = HEIGHT - 100;

const BALL_RADIUS = 25;

const INITIAL_BALL_X =  WIDTH / 2 - BALL_RADIUS / 2;
const INITIAL_BALL_Y = HEIGHT - 300 - BALL_RADIUS / 2;
let ballX = INITIAL_BALL_X;
let ballY = INITIAL_BALL_Y;

// + is down, right
const initVelocityX = 7;
const initVelocityY = 7;
const BALL_SPEED = Math.sqrt(initVelocityX * initVelocityX + initVelocityY * initVelocityY);
let ballVelocity = [initVelocityX, initVelocityY];

const NUM_COLS_OF_BRICKS = 12; // width auto determined
const NUM_ROWS_OF_BRICKS = 4;
const BRICK_HEIGHT = 80;

const BRICK_WALL_Y_START = 50;

// [x, y] coordinates of top left corners of bricks
let bricksPositions = [];


const brickWidth = (WIDTH / NUM_COLS_OF_BRICKS);

let pokerChipImg;
let slotMachineImg;
let pokerTableImg;

const cardImgSrcs = [
  "/img/2-hearts.png",
  "/img/7-clubs.png",
  "/img/8-spades.png",
  "/img/10-hearts.png",
  "/img/ace-spades.png",
  "/img/king-hearts.png",
]
let cardImgs = [];

function preload() {
  pokerChipImg = loadImage("/img/poker-chip.png");
  slotMachineImg = loadImage("/img/slot-machine.png");
  pokerTableImg = loadImage("/img/poker-table.png");
  for (const imgSrc of cardImgSrcs) {
    cardImgs.push(loadImage(imgSrc));
  }
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  noStroke();

  generateBricks();
}

function draw() {
  image(pokerTableImg, 0, 0, WIDTH, HEIGHT);
  drawBricks();

  drawPlatform();
  drawBall();
  platformMovement();
  ballPlatformCollisions();
  ballMovement();
  ballWallCollisions();
  ballBrickCollisions();

  
}

function drawPlatform() {
  image(slotMachineImg, platformX, platformY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
}

function drawBall() {
  // fill(255);
  // circle(ballX, ballY, 2 * BALL_RADIUS);

  // image(src, x, y, width, height);
  image(pokerChipImg, ballX - BALL_RADIUS, ballY - BALL_RADIUS, 2 * BALL_RADIUS, 2 * BALL_RADIUS);
}

function platformMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    platformX -= PLATFORM_SPEED
  } 
  if (keyIsDown(RIGHT_ARROW)) {
    platformX += PLATFORM_SPEED
  }
}

function ballMovement() {
  ballX += ballVelocity[0];
  ballY += ballVelocity[1];
}

function ballWallCollisions() {
  if (ballX + BALL_RADIUS >= WIDTH || ballX - BALL_RADIUS <= 0) { // right, left walls 
    ballVelocity[0] *= -1;
  } if (ballY - BALL_RADIUS <= 0 || ballY + BALL_RADIUS >= WIDTH) { // top, bottom walls
    //ballVelocity[1] *= -1
    resetBallPosition();
    resetBallVelocity();
  }
}

function resetBallPosition() {
  ballX = INITIAL_BALL_X;
  ballY = INITIAL_BALL_Y;
}

function resetBallVelocity() {
  ballVelocity = [initVelocityX, initVelocityY];
}

function ballPlatformCollisions() {

  const MAX_REFLECTION_ANGLE = Math.PI / 3; // 60 degrees from platform normal
  
  const isBetweenPlatformXBounds = ballX + BALL_RADIUS >= platformX && ballX - BALL_RADIUS <= platformX + PLATFORM_WIDTH;
  const isBetweenPlatformYBounds = ballY + BALL_RADIUS >= platformY && ballY - BALL_RADIUS <= platformY + PLATFORM_HEIGHT;

  const hitPlatformTop = isBetweenPlatformXBounds && ballY + BALL_RADIUS >= platformY && ballY < platformY;
  const hitPlatformLeft = isBetweenPlatformYBounds && (ballX + BALL_RADIUS >= platformX) && ballX < platformX + PLATFORM_WIDTH;
  const hitPlatformRight = isBetweenPlatformYBounds && (ballX - BALL_RADIUS <= platformX + PLATFORM_WIDTH) && ballX > platformX; 

  if (hitPlatformTop) {

    // calculate distance from ball to center
    let distance;
    if (ballX <= platformX + PLATFORM_WIDTH / 2) { // will be negative, ball is left of center
        distance = (Math.max(platformX, ballX)) - (platformX + PLATFORM_WIDTH / 2);
    } else { // positive since ball is right of center
        distance = Math.min(platformX + PLATFORM_WIDTH, ballX) - (platformX + PLATFORM_WIDTH / 2);
    }

    // ratio of distance to half the platform width
    // gives proportion of max angle to use
    const ratio = distance / (PLATFORM_WIDTH / 2);
    const angle = ratio * MAX_REFLECTION_ANGLE; 
    
    // setting velocity as angle/speed decompsition
    ballVelocity[0] = BALL_SPEED * Math.sin(angle);
    ballVelocity[1] = -1 * BALL_SPEED * Math.cos(angle);
    
    ballY = platformY - BALL_RADIUS - 2;
  }
  else if (hitPlatformLeft) {
    ballVelocity[0] *= -1;
    ballX = platformX - BALL_RADIUS - 2;
  } else if (hitPlatformRight) {
    ballVelocity[0] *= -1;
    ballX = platformX + PLATFORM_WIDTH + BALL_RADIUS + 2;
  }
}

function generateBricks() {
  for (let i = 0; i < NUM_COLS_OF_BRICKS; i ++) {
    for (let j = 0; j < NUM_ROWS_OF_BRICKS; j++) {

      const brickX = i * brickWidth;
      const brickY = BRICK_WALL_Y_START + j * BRICK_HEIGHT;
      const srcIndex = Math.floor(Math.random() * cardImgs.length);
      bricksPositions.push([brickX, brickY, srcIndex]);
    }
  }
}

function drawBricks() {
  for (const brick of bricksPositions) {
    const [brickX, brickY, srcIndex] = brick;
  
    // cardImgs index
    

    image(cardImgs[srcIndex], brickX, brickY, brickWidth, BRICK_HEIGHT);
    // rect(brickX, brickY, brickWidth, BRICK_HEIGHT);
  }
}

function ballBrickCollisions() {
  for (let i = bricksPositions.length - 1; i >= 0; i--) {
    const brick = bricksPositions[i];
    
    const [brickX, brickY] = brick;

    const isBetweenBrickXBounds = ballX + BALL_RADIUS > brickX && ballX - BALL_RADIUS < brickX + brickWidth;
    const isBetweenBrickYBounds = ballY - BALL_RADIUS < brickY + BRICK_HEIGHT && ballY + BALL_RADIUS > brickY;

    const hitBottomFace = isBetweenBrickXBounds && (ballY - BALL_RADIUS < brickY + BRICK_HEIGHT) && ballY > brickY + BRICK_HEIGHT;
    const hitRightFace = isBetweenBrickYBounds && (ballX - BALL_RADIUS < brickX + brickWidth) && ballX > brickX + brickWidth;
    const hitLeftFace = isBetweenBrickYBounds && (ballX + BALL_RADIUS > brickX) && ballX < brickX;
    const hitTopFace = isBetweenBrickXBounds && (ballY + BALL_RADIUS > brickY) && ballY < brickY;

    if (hitBottomFace) {
      ballVelocity[1] *= -1;
      ballY = brickY + BRICK_HEIGHT + BALL_RADIUS + 2;
      bricksPositions.splice(i, 1);
    } else if (hitRightFace){
      ballVelocity[0] *= -1;
      ballX = brickX + brickWidth + BALL_RADIUS + 2;
      bricksPositions.splice(i, 1);
    } else if (hitLeftFace) {
      ballVelocity[0] *= -1;
      ballX = brickX - BALL_RADIUS - 2;
      bricksPositions.splice(i, 1);
    } else if (hitTopFace) {
      ballVelocity[1] *= -1;
      ballY = brickY - BALL_RADIUS - 2;
      bricksPositions.splice(i, 1);
    }
    
  }
}
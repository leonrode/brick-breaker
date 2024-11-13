const SIZE = 800;

const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;

const PLATFORM_SPEED = 10;

let platformX = SIZE / 2 - PLATFORM_WIDTH / 2;
let platformY = SIZE - 100;

const BALL_RADIUS = 10;

const INITIAL_BALL_X =  SIZE / 2 - BALL_RADIUS / 2;
const INITIAL_BALL_Y = SIZE - 300 - BALL_RADIUS / 2;
let ballX = INITIAL_BALL_X;
let ballY = INITIAL_BALL_Y;

// + is down, right
const initVelocityX = 7;
const initVelocityY = 7;
const BALL_SPEED = Math.sqrt(initVelocityX * initVelocityX + initVelocityY * initVelocityY);
let ballVelocity = [initVelocityX, initVelocityY];

const NUM_COLS_OF_BRICKS = 15; // width auto determined
const NUM_ROWS_OF_BRICKS = 8;
const BRICK_HEIGHT = 20;

const BRICK_WALL_Y_START = 100;

function setup() {
  createCanvas(SIZE, SIZE);
  noStroke();

}

function draw() {
  background(0);
  generateBricks();

  

  drawPlatform();
  drawBall();
  platformMovement();
  ballPlatformCollisions();
  ballMovement();
  ballWallCollisions();


  
}

function drawPlatform() {
  fill(255);
  rect(platformX, platformY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
}

function drawBall() {
  fill(255);
  circle(ballX, ballY, 2 * BALL_RADIUS);
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
  if (ballX + BALL_RADIUS >= SIZE || ballX - BALL_RADIUS <= 0) { // right, left walls 
    ballVelocity[0] *= -1;
  } if (ballY - BALL_RADIUS <= 0 || ballY + BALL_RADIUS >= SIZE) { // top, bottom walls
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
  }
  else if (hitPlatformLeft || hitPlatformRight) {
    ballVelocity[0] *= -1;
  }
}

function generateBricks() {
  const BRICK_PADDING = 3;

  const effectiveWidth = SIZE - 2 * BRICK_PADDING;
  const brickWidth = (effectiveWidth / NUM_COLS_OF_BRICKS) - BRICK_PADDING;

  
  for (let i = 2 * BRICK_PADDING; i < effectiveWidth; i += (brickWidth + BRICK_PADDING)) {
    for (let j = 0; j < NUM_ROWS_OF_BRICKS; j++) {

      const brickX = i;
      const brickY = BRICK_WALL_Y_START + j * (BRICK_HEIGHT + BRICK_PADDING);

      rect(brickX, brickY, brickWidth, BRICK_HEIGHT);
    }
  }
}
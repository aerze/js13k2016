
import './libs/tiny-canvas.js';

/**
 * Tiny-Canvas Canvas
 * @type {TCCanvas}
 */
var CANVAS = TC(document.getElementById('c'));

/**
 * Tint-Canvas
 * @type {TCGLContext}
 */
var GL = CANVAS.g;

/**
 * Is RIGHT key pressed
 * @type {Boolean}
 */
var RIGHT = false;

/**
 * Is LEFT key pressed
 * @type {Boolean}
 */
var LEFT = false;

/**
 * Is JUMP Key pressed
 * @type {Boolean}
 */
var JUMP = false;

/**
 * Positive jump speed
 * @type {Number}
 */
var JUMP_SPEED = 8;
/**
 * Direction Player is facing
 * R = right L = left
 * @type {String}
 */
var DIR = 'R';

/**
 * is Player touching the ground
 * @type {Boolean}
 */
var GROUND = true;

/**
 * Player walk speed
 * @type {Number}
 */
var WALK_SPEED = 1;

/**
 * Top Player walk speed
 * @type {Number}
 */
var TOP_SPEED = 4;

/**
 * Number of images whose load has completed
 * @type {Number}
 */
var IMAGES_LOADED = 0;

/**
 * Total Number of images expected to load
 * @type {Number}
 */
var TOTAL_IMAGES = 1;

/**
 * Player Sprite object
 * @type {Sprite}
 */
var Player = {};

/**
 * Player .png
 * @type {Image}
 */
var PlayerImage = new Image();

/**
 * Player image as Tiny-Canvas Texture
 * @type {TCTexture}
 */
var PlayerTexture = null;

/**
 * List of frames in the Player Image
 * @type {Array}
 */
var PlayerFrames = [
  [0, 0, 16, 20],
  [16, 0, 16, 20],
  [32, 0, 16, 20],
  [48, 0, 16, 20],
  [64, 0, 16, 20],
  [80, 0, 16, 20],
];

/**
 * TODO: Add desc
 * @type {Number}
 */
var GRAVITY = 0.5;

/**
 * Proxy func for Math.random
 * @type {Function}
 * @returns {Number} Between 0 & 1
 */
var rand = Math.random();

/**
 * Canvas Width (256)
 * @type {Number}
 */
var MAX_X = CANVAS.c.width;

/**
 * Canvas X Origin
 * @type {Number}
 */
var MIN_X = 0;

/**
 * Canvas Height (256)
 * @type {Number}
 */
var MAX_Y = CANVAS.c.height;

/**
 * Canvas Y Origin
 * @type {Number}
 */
var MIN_Y = 0;

/**
 * Array of objects to push to the update + draw functions
 * @type {Array}
 */
var DisplayObjectArray = [];

/**
 * @class An Image based DisplayObject
 * @param {Number} x       Starting X position
 * @param {Number} y       Starting Y position
 * @param {TCTexture} texture Tiny-Canvas Texture object
 * @param {Number[]} frame   Frame position data [x, y, width, height]
 * @return {Sprite}
 */
function Sprite(x, y, texture, frame) {
  /**
   * Canvas X position
   * @type {Number}
   */
  this.posX = x;

  /**
   * Canvas Y position
   * @type {Number}
   */
  this.posY = y;

  /**
   * Frame width
   * @type {Number}
   */
  this.width = frame[2];

  /**
   * Frame Height
   * @type {[type]}
   */
  this.height = frame[3];

  /**
   * Speed on the X plane
   * Left = 0, Right = Canvas Width
   * @type {Number}
   */
  this.speedX = 0;

  /**
   * Speed on the Y plane.
   * Top = 0, Bottom = Canvas.height
   * @type {Number}
   */
  this.speedY = 0;

  /**
   * Rotation ?? Radians? Degrees?
   * @type {Number}
   */
  this.rotation = 0;

  /**
   * FrameX / Texture's total width;
   * @type {Number}
   */
  this.u0 = frame[0] / texture.width;

  /**
   * FrameY / Texture's total height
   * @type {Number}
   */
  this.v0 = frame[1] / texture.height;

  /**
   * u0 plus (Frame's width / Texture's total Width)
   * @type {Number}
   */
  this.u1 = this.u0 + (frame[2] / texture.width);

  /**
   * v0 plus (Frame's height / Texture's total height)
   * @type {[type]}
   */
  this.v1 = this.v0 + (frame[3] / texture.height);

  /**
   * Half of the Frame's width
   * @type {Number}
   */
  this.halfWidth = frame[2] / 2;

  /**
   * Half of the Frame's height
   * @type {Number}
   */
  this.halfHeight = frame[3] / 2;
}


/**
 * Sets source on all images to start loading
 */
function load() {
  PlayerImage.src = 'assets/person_cut.png';
}

/**
 * Fired on every load, will call create once last image has loaded
 */
function loadComplete() {
  if (IMAGES_LOADED !== TOTAL_IMAGES) return;
  create();
}

/**
 * Creates all sprites
 */
function create() {
  Player = new Sprite(20, 0, PlayerTexture, PlayerFrames[0]);

  CANVAS.bkg(0.227, 0.227, 0.227);
  mainLoop();
}

/**
 * MAIN LOOP UPDATE
 * very hot code path, try not to make many function calls
 * only read and set values if at all possible
 */
function update() {
  /**
   * HANDLE KEY PRESSES
   * update player speeds by preset speeds
   */
  if (RIGHT) {
    Player.speedX = Math.min(Player.speedX + WALK_SPEED, TOP_SPEED);
  }

  if (LEFT) {
    Player.speedX = Math.max(Player.speedX - WALK_SPEED, -TOP_SPEED);
  }

  if (JUMP && GROUND) {
    Player.speedY = -JUMP_SPEED;
    GROUND = false;
  }

  /**
   * Update player to new position
   */
  Player.posX += Player.speedX;
  Player.posY += Player.speedY;

  /**
   * Update Player gravity
   */
  Player.speedY += GRAVITY;

  /**
   * Apply friction to player if they're walking
   */
  if (Math.abs(Player.speedX) < 1) {
    Player.speedX = 0;
  } else {
    Player.speedX *= 0.9;
  }

  /**
   * Clamp Player to Canvas
   */
  if (Player.posY + Player.height >= MAX_Y) {
    Player.posY = MAX_Y - Player.height;
    Player.speedY = 0;
    GROUND = true;
  } else if (Player.posY < MIN_Y) {
    Player.posY = MIN_Y;
  }

  if (Player.posX > MAX_X) {
    Player.speedX *= -1;
    Player.posX = MAX_X;
  } else if (Player.posX < MIN_X) {
    Player.speedX *= -1;
    Player.posX = MIN_X;
  }
}

/**
 * MAIN LOOP DRAW
 * very hot code path, try not to make many function calls
 * only read and set values if at all possible
 */
function draw() {
  /**
   * Clear canvas
   */
  CANVAS.cls();

  CANVAS.push();
  CANVAS.trans(Player.posX, Player.posY);
  CANVAS.rot(Player.rotation);

  if (DIR === 'R') {
    CANVAS.scale(1, 1);
  } else {
    CANVAS.scale(-1, 1);
  }

  CANVAS.img(
    PlayerTexture,
    -Player.halfWidth,
    0,
    Player.width,
    Player.height,
    Player.u0,
    Player.v0,
    Player.u1,
    Player.v1
  );

  CANVAS.pop();

  CANVAS.flush();
}

/**
 * MAIN GAME LOOP
 */
function mainLoop() {
  requestAnimationFrame(mainLoop);
  update();
  draw();
}

/**
 * Handler for keyUp events
 * @param  {Event} event Any key presses
 */
document.onkeydown = function (event) {
  if (event.keyCode === 37) {
    LEFT = true;
    DIR = 'L';
    event.preventDefault();
  } else if (event.keyCode === 38) {
    JUMP = true;
    event.preventDefault();
  } else if (event.keyCode === 39) {
    RIGHT = true;
    DIR = 'R';
    event.preventDefault();
  }
};

/**
 * Handler for keyDown events
 * @param  {Event} event Any key up
 */
document.onkeyup = function (event) {
  if (event.keyCode === 37) {
    LEFT = false;
  } else if (event.keyCode === 38) {
    JUMP = false;
  } else if (event.keyCode === 39) {
    RIGHT = false;
  }
};

/**
 * Callback for image load
 * @return {[type]} [description]
 */
PlayerImage.onload = function () {
  PlayerTexture = TCTex(GL, PlayerImage, PlayerImage.width, PlayerImage.height);
  IMAGES_LOADED += 1;
  loadComplete();
};

load();

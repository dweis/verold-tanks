var uuid = require('node-uuid'),
    CANNON = require('../../vendor/cannon'),
    Projectile = require('./projectile');

var STEP_DELTA = 1 / 60,
    TANK_SHAPE = new CANNON.Box(new CANNON.Vec3(0.225, 0.12, 0.35)),
    TANK_MASS = 500,
    TANK_LINEAR_DAMPING = 0.3,
    TANK_ANGULAR_DAMPING = 0.3,
    TANK_IMPULSE_FORWARD = 25,
    TANK_IMPULSE_REVERSE = -15,
    TANK_TURN_VELOCITY = 100,
    TANK_TURRET_DEGREES_PER_SEC = 45,
    TANK_GUN_DEGREES_PER_SEC = 22.5,
    TANK_SPAWN_AREA_SIZE = 8,
    TANK_RATE_OF_FIRE = 0.75;

function Tank(physics) {
  this.uuid = uuid.v4();
  this.type = 'tank';
  this.physics = physics;
  this.body = undefined;
  this.keys = {};
  this.turretAngle = 0;
  this.gunAngle = 0;
  this.active = true;
  this.lastFire = 0;
}

Tank.prototype.preStep = function() {
  if (this.parentObject.active) {
    if (this.parentObject.keys.W) {
      this.parentObject.forward(STEP_DELTA);
    }
    if (this.parentObject.keys.S) {
      this.parentObject.reverse(STEP_DELTA);
    }
    if (this.parentObject.keys.A) {
      this.parentObject.left(STEP_DELTA);
    }
    if (this.parentObject.keys.D) {
      this.parentObject.right(STEP_DELTA);
    }
    if (this.parentObject.keys.leftArrow) {
      this.parentObject.turretLeft(STEP_DELTA);
    }
    if (this.parentObject.keys.rightArrow) {
      this.parentObject.turretRight(STEP_DELTA);
    }
    if (this.parentObject.keys.upArrow) {
      this.parentObject.gunUp(STEP_DELTA);
    }
    if (this.parentObject.keys.downArrow) {
      this.parentObject.gunDown(STEP_DELTA);
    }
  }
};

Tank.prototype.init = function() {
  var x = -(TANK_SPAWN_AREA_SIZE / 2) + Math.random() * TANK_SPAWN_AREA_SIZE;
  var z = -(TANK_SPAWN_AREA_SIZE / 2) + Math.random() * TANK_SPAWN_AREA_SIZE;

  this.body = new CANNON.RigidBody(TANK_MASS, TANK_SHAPE);

  this.body.position.set(x, 0.2, z);
  this.body.linearDamping = TANK_LINEAR_DAMPING;
  this.body.angularDamping = TANK_ANGULAR_DAMPING;

  this.body.parentObject = this;

  this.body.preStep = this.preStep;

  this.physics.add(this);
};

Tank.prototype.fire = function() {
  var time = Date.now(),
      projectile;

  if (this.active === false || this.lastFire + (TANK_RATE_OF_FIRE * 1000) > time) {
    return;
  }

  this.lastFire = time;

  console.log('Tank %s has fired Turret Angle: %s Gun Angle: %s', this.uuid, this.turretAngle, this.gunAngle);

  projectile = new Projectile(this);

  projectile.init();

  this.physics.emit('projectile', projectile, this);
};

Tank.prototype.left = function(delta) {
  this.body.angularVelocity.vadd(new CANNON.Vec3(0, TANK_TURN_VELOCITY * delta,0), this.body.angularVelocity);
};

Tank.prototype.right = function(delta) {
  this.body.angularVelocity.vadd(new CANNON.Vec3(0, -TANK_TURN_VELOCITY * delta,0), this.body.angularVelocity);
};

Tank.prototype.forward = function(delta) {
  var force = this.body.quaternion.vmult(new CANNON.Vec3(0, 0, TANK_IMPULSE_FORWARD));
  var worldPoint = new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z);
  this.body.applyImpulse(worldPoint, force, delta);
};

Tank.prototype.reverse = function(delta) {
  var force = this.body.quaternion.vmult(new CANNON.Vec3(0, 0, TANK_IMPULSE_REVERSE));
  var worldPoint = new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z);
  this.body.applyImpulse(worldPoint, force, delta);
};

Tank.prototype.turretLeft = function(delta) {
  this.turretAngle += ((TANK_TURRET_DEGREES_PER_SEC  * Math.PI) / 180) * delta;
};

Tank.prototype.turretRight = function(delta) {
  this.turretAngle -= ((TANK_TURRET_DEGREES_PER_SEC  * Math.PI) / 180) * delta;
};

Tank.prototype.gunUp = function(delta) {
  if (this.gunAngle >= 0) {
    this.gunAngle = Math.max(0, this.gunAngle - ((TANK_GUN_DEGREES_PER_SEC  * Math.PI) / 180) * delta);
  }
};

Tank.prototype.gunDown = function(delta) {
  if (this.gunAngle <= 1) {
    this.gunAngle = Math.min(1, this.gunAngle + ((TANK_GUN_DEGREES_PER_SEC  * Math.PI) / 180) * delta);
  }
};

module.exports = Tank;

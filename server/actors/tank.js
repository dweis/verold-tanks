var uuid = require('node-uuid')
  , CANNON = require('../../vendor/cannon')
  , Projectile = require('./projectile');

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
  // fixme, get real delta for frame
  var delta = 1/60;

  if (this.parentObject.active) {
    if (this.parentObject.keys.W) {
      this.parentObject.forward(delta, this.parentObject);
    }
    if (this.parentObject.keys.S) {
      this.parentObject.reverse(delta, this.parentObject);
    }
    if (this.parentObject.keys.A) {
      this.parentObject.left(delta, this.parentObject);
    }
    if (this.parentObject.keys.D) {
      this.parentObject.right(delta, this.parentObject);
    }
    if (this.parentObject.keys.leftArrow) {
      this.parentObject.turretAngle += ((90  * Math.PI) / 180) * delta;
    }
    if (this.parentObject.keys.rightArrow) {
      this.parentObject.turretAngle -= ((90  * Math.PI) / 180) * delta;
    }
    if (this.parentObject.keys.upArrow && this.parentObject.gunAngle >= 0) {
      this.parentObject.gunAngle = Math.max(0, this.parentObject.gunAngle - ((90  * Math.PI) / 180) * delta);
    }
    if (this.parentObject.keys.downArrow && this.parentObject.gunAngle <= 1) {
      this.parentObject.gunAngle = Math.min(1, this.parentObject.gunAngle + ((90  * Math.PI) / 180) * delta);
    }
  }
}

Tank.prototype.init = function() {
  var x = -7.5 + Math.random() * 15;
  var z = -7.5 + Math.random() * 15;

  var boxShape = new CANNON.Box(new CANNON.Vec3(0.225, 0.1, 0.35))
    , boxBody = new CANNON.RigidBody(1000, boxShape);

  boxBody.position.set(x, 1, z);
  boxBody.linearDamping = boxBody.angularDamping = 0.0;

  boxBody.parentObject = this;

  boxBody.preStep = this.preStep;

  this.body = boxBody;

  this.physics.add(this);
}

Tank.prototype.fire = function() {
  var time = Date.now()
    , projectile;

  if (this.active == false || this.lastFire + 750 > time) return;

  this.lastFire = time;

  console.log('Tank %s has fired Turret Angle: %s Gun Angle: %s', this.uuid, this.turretAngle, this.gunAngle);

  projectile = new Projectile(this);

  projectile.init();

  this.physics.emit('projectile', projectile, this);
}

Tank.prototype.left = function(delta, tank) {
  this.body.angularVelocity.vadd(new CANNON.Vec3(0, 150 * delta,0), this.body.angularVelocity);
}

Tank.prototype.right = function(delta, tank) {
  this.body.angularVelocity.vadd(new CANNON.Vec3(0, -150 * delta,0), this.body.angularVelocity);
}

Tank.prototype.forward = function(delta, tank) {
  var f = 25;
  var force = this.body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z);
  this.body.applyImpulse(worldPoint, force, delta);
}

Tank.prototype.reverse = function(delta, tank) {
  var f = -15;
  var force = this.body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z);
  this.body.applyImpulse(worldPoint, force, delta);
}

module.exports = Tank;

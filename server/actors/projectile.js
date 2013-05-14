var uuid = require('node-uuid'),
    CANNON = require('../../vendor/cannon');

var PROJECTILE_FORCE = 100,
    PROJECTILE_MASS = 25,
    PROJECTILE_SHAPE = new CANNON.Box(new CANNON.Vec3(0.015, 0.015, 0.05)),
    PROJECTILE_OFFSET = new CANNON.Vec3(0, 0.05, 0.4),
    PROJECTILE_LINEAR_DAMPING = 0.3,
    PROJECTILE_ANGULAR_DAMPING = 0.3;

function Projectile(tank) {
  this.uuid = uuid.v4();
  this.tank = tank;
  this.physics = tank.physics;
  this.body = undefined;
  this.type = 'projectile';
  this.timeShot = Date.now();
}

Projectile.prototype.init = function() {
  var that = this,
      offset,
      worldPoint = new CANNON.Vec3();

  this.body = new CANNON.RigidBody(PROJECTILE_MASS, PROJECTILE_SHAPE);
  this.body.linearDamping = PROJECTILE_LINEAR_DAMPING;
  this.body.angularDamping = PROJECTILE_ANGULAR_DAMPING;

  this.computeQuaternion().copy(this.body.quaternion);

  this.tank.body.position.copy(this.body.position);

  offset = this.body.quaternion.vmult(PROJECTILE_OFFSET);
  this.body.position.vadd(offset, this.body.position);

  this.tank.body.position.copy(worldPoint);

  this.body.applyImpulse(worldPoint, this.computeForce(), 0.1);

  this.collisionListener = function(e) {
    if (e.with.parentObject) {
      if (e.with.parentObject.type === 'tank' && e.with.parentObject.uuid !== that.tank.uuid) {
        e.with.parentObject.active = false;
        that.physics.emit('kill', { who: e.with.parentObject.uuid, by: that.tank.uuid });
        that.body.removeEventListener('collide', that.collisionListener);
      }
    }
  };

  this.body.addEventListener('collide', this.collisionListener);

  this.physics.add(this);
};

Projectile.prototype.computeQuaternion = function() {
  var tmpQuaternion = new CANNON.Quaternion(),
      direction = new CANNON.Quaternion(),
      tmpVec = new CANNON.Vec3();

  // Apply gun angle rotation
  tmpQuaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), this.tank.gunAngle);
  direction = tmpQuaternion.mult(direction);

  // Apply turret angle rotation
  tmpQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.tank.turretAngle);
  direction = tmpQuaternion.mult(direction);

  // Finally apply tank body rotation
  this.tank.body.quaternion.toEuler(tmpVec);
  tmpQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), tmpVec.y);
  direction = tmpQuaternion.mult(direction);

  return direction;
};

Projectile.prototype.computeForce = function() {
  return this.body.quaternion.vmult(new CANNON.Vec3(0, 0, PROJECTILE_FORCE));
};

module.exports = Projectile;

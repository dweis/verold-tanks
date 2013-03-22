var uuid = require('node-uuid')
  , CANNON = require('../../vendor/cannon');

function Projectile(tank) {
  this.uuid = uuid.v4();
  this.tank = tank;
  this.physics = tank.physics;
  this.body = undefined;
  this.type = 'projectile';
  this.timeShot = Date.now();
}

Projectile.prototype.init = function() {
  var that = this
    , direction = new CANNON.Quaternion()
    , tmpVec = new CANNON.Vec3()
    , q = new CANNON.Quaternion()
    , force
    , worldPoint
    , boxShape
    , boxBody
    , f = 40;

  boxShape = new CANNON.Box(new CANNON.Vec3(0.015, 0.015, 0.05))
  boxBody = new CANNON.RigidBody(10,boxShape);

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), this.tank.gunAngle);

  direction = q.mult(direction)

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.tank.turretAngle);

  direction = q.mult(direction);

  this.tank.body.quaternion.toEuler(tmpVec);

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), tmpVec.y);

  direction = q.mult(direction)

  direction.copy(boxBody.quaternion);

  force = boxBody.quaternion.vmult(new CANNON.Vec3(0, 0, f));

  worldPoint = new CANNON.Vec3(boxBody.position.x, boxBody.position.y, boxBody.position.z);

  boxBody.position.set(this.tank.body.position.x, this.tank.body.position.y, this.tank.body.position.z);
  boxBody.position.vadd(boxBody.quaternion.vmult(new CANNON.Vec3(0, 0.11, 0.4)), boxBody.position);
  boxBody.linearDamping = boxBody.angularDamping = 0.0;

  boxBody.applyImpulse(worldPoint, force, 0.25);

  var collisionListener = function(e) {
    if (e.with.parentObject) {
      if (e.with.parentObject.type == 'tank' && e.with.parentObject.uuid != that.tank.uuid) {
        e.with.parentObject.active = false;
        that.physics.emit('kill', { who: e.with.parentObject.uuid, by: that.tank.uuid });
        boxBody.removeEventListener('collide', collisionListener);
      }
    }
  }

  boxBody.addEventListener('collide', collisionListener);

  this.body = boxBody;

  this.physics.add(this);
}

module.exports = Projectile;

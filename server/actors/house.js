var uuid = require('node-uuid')
  , CANNON = require('../../vendor/cannon');

var HOUSE_MASS = 10000
  , HOUSE_SHAPE = new CANNON.Box(new CANNON.Vec3(0.75/2, 1/2, 1.25/2))
  , HOUSE_LINEAR_DAMPING = 0.3
  , HOUSE_ANGULAR_DAMPING = 0.3;

function House(physics, entityData) {
  this.uuid = uuid.v4();
  this.physics = physics;
  this.body = undefined;
  this.type = 'projectile';
  this.entityData = entityData;
}

House.prototype.init = function() {
  var that = this
    , offset
    , worldPoint = new CANNON.Vec3();

  this.body = new CANNON.RigidBody(HOUSE_MASS, HOUSE_SHAPE);
  this.body.linearDamping = HOUSE_LINEAR_DAMPING;
  this.body.angularDamping = HOUSE_ANGULAR_DAMPING;

  this.body.position.set(this.entityData.position.x, 0.5, this.entityData.position.z);
  this.body.quaternion.set(this.entityData.orientation.x, this.entityData.orientation.y,
      this.entityData.orientation.z, this.entityData.orientation.w);

  this.physics.add(this);
}

module.exports = House;

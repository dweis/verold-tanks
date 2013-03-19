var CANNON = require('../vendor/cannon');

function applyForce(body,worldPoint,force,dt){
  dt = dt || 1/60;
  var r=new CANNON.Vec3();
  worldPoint.vsub(body.position,r);
  body.force.vadd(force.mult(dt),body.velocity);
};

function Physics() {
  var that = this;

  this.world = new CANNON.World();
  this.world.gravity.set(0, -9.82, 0);
  this.world.broadphase = new CANNON.NaiveBroadphase();
  this.world.solver.iterations = 10;
  this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
  this.world.defaultContactMaterial.contactEquationRegularizationTime = 3;

  this.defaultMaterial = new CANNON.Material('default');
  this.defaultContactMaterial = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, 0.05, 0.05);
  this.world.addContactMaterial(this.defaultContactMaterial);

  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.RigidBody(0,groundShape, this.defaultMaterial);
  groundBody.position.set(0,0,0);
  var q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(-1,0,0), 0.5 * Math.PI);
  groundBody.quaternion.set(q.x,q.y,q.z,q.w);
  this.world.add(groundBody);

  this.groundBody = groundBody;

  setInterval(function() {
    that.update();
  }, 1000 / 60);
}

Physics.prototype.update = function(delta) {
  this.world.step(delta);
}

Physics.prototype.addTank = function() {
  var boxShape = new CANNON.Box(new CANNON.Vec3(0.3,0.1,0.35))
    , boxBody = new CANNON.RigidBody(1000,boxShape, this.defaultMaterial);

  boxBody.position.set(0,20,0);
  boxBody.linearDamping = boxBody.angularDamping = 0.5;

  this.world.add(boxBody);

  return boxBody;
}

Physics.prototype.left = function(body) {
  body.angularVelocity.set(0,5,0);
}

Physics.prototype.right = function(body) {
  body.angularVelocity.set(0,-5,0);
}

Physics.prototype.forward = function(body) {
  var dt = 1/60;
  var f = 200;
  var force = body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
  applyForce(body,worldPoint,force,dt);
}

Physics.prototype.reverse = function(body) {
  var dt = 1/60;
  var f = -150;
  var force = body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
  applyForce(body, worldPoint,force,dt);
}

module.exports = Physics;

var CANNON = require('cannon');

function Physics() {
  var that = this;

  this.world = new CANNON.World();
  this.world.gravity.set(0, -9.82, 0);
  this.world.broadphase = new CANNON.NaiveBroadphase();
  this.world.solver.iterations = 10;
  this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
  this.world.defaultContactMaterial.contactEquationRegularizationTime = 4;

  this.defaultMaterial = new CANNON.Material('default');
  this.defaultContactMaterial = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, 0.5, 0.0);
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
  }, 1000 / 120);
}

Physics.prototype.update = function(delta) {
  this.world.step(delta);
}

Physics.prototype.addTank = function() {
  var boxShape = new CANNON.Sphere(0.1)//new CANNON.Box(new CANNON.Vec3(0.05,0.05,0.1))
    , boxBody = new CANNON.RigidBody(1000,boxShape);

  boxBody.position.set(0,5,0);
  boxBody.linearDamping = boxBody.angularDamping = 0.5;

  this.world.add(boxBody);

  return boxBody;
}

module.exports = Physics;

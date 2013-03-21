var _ = require('underscore')
  , CANNON = require('../vendor/cannon');

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
  this.defaultContactMaterial = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, 0.01, 0.01);
  this.world.addContactMaterial(this.defaultContactMaterial);

  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.RigidBody(0,groundShape, this.defaultMaterial);
  groundBody.position.set(0,0,0);
  var q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(-1,0,0), 0.5 * Math.PI);
  groundBody.quaternion.set(q.x,q.y,q.z,q.w);
  this.world.add(groundBody);

  this.groundBody = groundBody;
}

Physics.prototype.update = function(tanks, delta) {
  var that = this;

  _.each(tanks, function(tank) {
    if (tank.keys.W) {
      that.forward(delta, tank.body);
    }
    if (tank.keys.S) {
      that.reverse(delta, tank.body);
    }
    if (tank.keys.A) {
      that.left(delta, tank.body);
    }
    if (tank.keys.D) {
      that.right(delta, tank.body);
    }
    if (tank.keys.leftArrow) {
      tank.turretAngle += ((90  * Math.PI) / 180) * delta;
    }
    if (tank.keys.rightArrow) {
      tank.turretAngle -= ((90  * Math.PI) / 180) * delta;
    }
    if (tank.keys.upArrow && tank.gunAngle >= 0) {
      tank.gunAngle -= ((90  * Math.PI) / 180) * delta;
    }
    if (tank.keys.downArrow && tank.gunAngle <= 0.9) {
      tank.gunAngle += ((90  * Math.PI) / 180) * delta;
    }
  });

  this.world.step(delta);
}

Physics.prototype.addTank = function() {
  var boxShape = new CANNON.Box(new CANNON.Vec3(0.225,0.1,0.35))
    , boxBody = new CANNON.RigidBody(1000,boxShape, this.defaultMaterial);

  boxBody.position.set(0,20,0);
  boxBody.linearDamping = boxBody.angularDamping = 0.5;

  this.world.add(boxBody);

  return boxBody;
}

Physics.prototype.left = function(delta, body) {
  body.angularVelocity.set(0,5,0);
}

Physics.prototype.right = function(delta, body) {
  body.angularVelocity.set(0,-5,0);
}

Physics.prototype.forward = function(delta, body) {
  var f = 100;
  var force = body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
  applyForce(body,worldPoint,force,delta);
}

Physics.prototype.reverse = function(delta, body) {
  var f = -70;
  var force = body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
  applyForce(body,worldPoint,force,delta);
}

module.exports = Physics;

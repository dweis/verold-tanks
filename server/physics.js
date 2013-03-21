var events = require('events')
  , _ = require('underscore')
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

Physics.prototype = new events.EventEmitter;

Physics.prototype.update = function(tanks, delta) {
  var that = this;

  _.each(tanks, function(tank) {
    if (tank.keys.W) {
      that.forward(delta, tank);
    }
    if (tank.keys.S) {
      that.reverse(delta, tank);
    }
    if (tank.keys.A) {
      that.left(delta, tank);
    }
    if (tank.keys.D) {
      that.right(delta, tank);
    }
    if (tank.keys.leftArrow) {
      tank.turretAngle += ((90  * Math.PI) / 180) * delta;
    }
    if (tank.keys.rightArrow) {
      tank.turretAngle -= ((90  * Math.PI) / 180) * delta;
    }
    if (tank.keys.upArrow && tank.gunAngle >= 0) {
      tank.gunAngle = Math.max(0, tank.gunAngle - ((90  * Math.PI) / 180) * delta);
    }
    if (tank.keys.downArrow && tank.gunAngle <= 1) {
      tank.gunAngle = Math.min(1, tank.gunAngle + ((90  * Math.PI) / 180) * delta);
    }
  });

  this.world.step(delta);
}

Physics.prototype.addTank = function() {
  var boxShape = new CANNON.Box(new CANNON.Vec3(0.225,0.1,0.35))
    , boxBody = new CANNON.RigidBody(1000,boxShape, this.defaultMaterial);

  boxBody.position.set(0,1,0);
  boxBody.linearDamping = boxBody.angularDamping = 0.5;

  this.world.add(boxBody);

  return boxBody;
}

Physics.prototype.removeBody = function(body) {
  this.world.remove(body);
}

Physics.prototype.left = function(delta, tank) {
  tank.body.angularVelocity.set(0,5,0);
}

Physics.prototype.right = function(delta, tank) {
  tank.body.angularVelocity.set(0,-5,0);
}

Physics.prototype.forward = function(delta, tank) {
  var f = 100;
  var force = tank.body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(tank.body.position.x, tank.body.position.y, tank.body.position.z);
  applyForce(tank.body,worldPoint,force,delta);
}

Physics.prototype.reverse = function(delta, tank) {
  var f = -70;
  var force = tank.body.quaternion.vmult(new CANNON.Vec3(0, 0, f));
  var worldPoint = new CANNON.Vec3(tank.body.position.x, tank.body.position.y, tank.body.position.z);
  applyForce(tank.body,worldPoint,force,delta);
}

Physics.prototype.fire = function(tank) {
  var direction = new CANNON.Quaternion()
    , q = new CANNON.Quaternion()
    , force
    , worldPoint
    , boxShape
    , boxBody
    , f = 50;

  console.log('Tank %s has fired Turret Angle: %s Gun Angle: %s', tank.uuid, tank.turretAngle, tank.gunAngle);

  boxShape = new CANNON.Box(new CANNON.Vec3(0.015, 0.015, 0.05))
  boxBody = new CANNON.RigidBody(10,boxShape, this.defaultMaterial);

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), tank.gunAngle);

  direction = q.mult(direction)

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), tank.turretAngle);

  direction = q.mult(direction);

  var tmpVec = new CANNON.Vec3();
  tank.body.quaternion.toEuler(tmpVec);

  q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), tmpVec.y);

  direction = q.mult(direction)

  direction.copy(boxBody.quaternion);

  this.world.add(boxBody);

  force = boxBody.quaternion.vmult(new CANNON.Vec3(0, 0, f));

  worldPoint = new CANNON.Vec3(boxBody.position.x, boxBody.position.y, boxBody.position.z);

  boxBody.position.set(tank.body.position.x, tank.body.position.y, tank.body.position.z);
  boxBody.position.vadd(boxBody.quaternion.vmult(new CANNON.Vec3(0, 0.15, 0.3)), boxBody.position);
  //boxBody.position.vadd(tank.body.quaternion.vmult(new CANNON.Vec3(0, 0, 10), boxBody.position));
  boxBody.linearDamping = boxBody.angularDamping = 0.1;

  applyForce(boxBody, worldPoint, force, 0.25);

  this.emit('projectile', boxBody, tank);
}

module.exports = Physics;

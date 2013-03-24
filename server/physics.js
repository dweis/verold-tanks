var events = require('events')
  , _ = require('underscore')
  , CANNON = require('../vendor/cannon')
  , Tank = require('./actors/tank')
  , House = require('./actors/house');

function Physics() {
  var that = this;

  this.objects = [];
  this.mapEntities = [];

  this.world = new CANNON.World();
  this.world.gravity.set(0, -9.82, 0);
  this.world.broadphase = new CANNON.NaiveBroadphase();
  this.world.solver.iterations = 10;
  this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
  this.world.defaultContactMaterial.contactEquationRegularizationTime = 10;

  this.defaultMaterial = new CANNON.Material('default');
  this.defaultContactMaterial = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, 0.5, 0.2);
  this.world.addContactMaterial(this.defaultContactMaterial);

  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.RigidBody(0,groundShape, this.defaultMaterial);
  groundBody.position.set(0,0,0);
  var q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(-1,0,0), 0.5 * Math.PI);
  groundBody.quaternion.set(q.x,q.y,q.z,q.w);
  groundBody.type = 'ground';
  this.world.add(groundBody);

  this.groundBody = groundBody;
}

Physics.prototype = new events.EventEmitter;

Physics.prototype.update = function(tanks, delta) {
  var that = this;

  this.world.step(delta);
}

Physics.prototype.addTank = function() {
  var tank = new Tank(this);

  tank.init();

  return tank;
}

Physics.prototype.add = function(object) {
  this.objects.push(object);

  this.world.add(object.body);
}

Physics.prototype.remove = function(object) {
  var that = this;

  this.world.remove(object.body);

  _.each(this.objects, function(obj,idx) {
    if (obj.uuid == object.uuid) {
      that.objects.splice(idx, 1);
    }
  });
}

Physics.prototype.createMap = function(map) {
  var that = this;
  _.each(map.entities, function(mapEntity) {
    var entity;
    if (mapEntity.type == 'house') {
      entity = new House(that, mapEntity);
      entity.init();
    }
  });
}

module.exports = Physics;

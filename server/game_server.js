var _ = require('underscore')
  , uuid = require('node-uuid')
  , Physics = require('./physics')
  , CANNON = require('cannon');

function GameServer(io) {
  this.io = io;

  this.physics = new Physics();
  this.tanks = [];
}

GameServer.prototype.initSockets = function() {
  var that = this;

  this.io.sockets.on('connection', function(socket)  {
    that.createTank(socket);
  });

  setInterval(function() {
    that.update();
  }, 1000/60);
}

GameServer.prototype.init = function() {
  this.initSockets();
}

GameServer.prototype.createTank = function(socket) {
  var tank = { socket: socket, body: this.physics.addTank(), uuid: uuid.v4() };

  this.tanks.push(tank);

  socket.emit('init', { uuid: tank.uuid });

  socket.on('left', function() {
    tank.body.angularVelocity.set(0,5,0);
  });

  socket.on('right', function() {
    tank.body.angularVelocity.set(0,-5,0);
  });

  socket.on('forward', function() {
    //var radius=1, mass=1, f=100;
    //    var dt=1/60, damping=0.5;
    // Add an impulse to the center
    var worldPoint = new CANNON.Vec3(0,0,0);
    var force = new CANNON.Vec3(0,0,10);
    tank.body.applyImpulse(worldPoint,force,1/60);
  });
}

GameServer.prototype.getUpdateObject = function() {
  var updateObj = { tanks: [], projectiles: [] };

  _.each(this.tanks, function(tank) {
    updateObj.tanks.push(tank.uuid);
    updateObj.tanks.push(tank.body.position.x);
    updateObj.tanks.push(tank.body.position.y);
    updateObj.tanks.push(tank.body.position.z);
    updateObj.tanks.push(tank.body.quaternion.x);
    updateObj.tanks.push(tank.body.quaternion.y);
    updateObj.tanks.push(tank.body.quaternion.z);
    updateObj.tanks.push(tank.body.quaternion.w);
  });

  return updateObj;
}

GameServer.prototype.update = function() {
  if (this.tanks.length) {
    console.log(this.tanks[0].body.position);

    this.io.sockets.emit('update', this.getUpdateObject());
  }
}

module.exports = GameServer;

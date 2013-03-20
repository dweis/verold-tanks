var _ = require('underscore')
  , uuid = require('node-uuid')
  , Physics = require('./physics')
  , CANNON = require('../vendor/cannon');

function GameServer(io) {
  this.io = io;

  this.physics = new Physics();
  this.tanks = [];
}

GameServer.prototype.initSockets = function() {
  var that = this;

  this.io.sockets.on('connection', function(socket)  {
    var tank = that.createTank(socket);

    socket.on('disconnect', function() {
      that.removeTank(tank);
    });
  });

  setInterval(function() {
    that.update(1/60);
  }, 1000/60);

  setInterval(function() {
    that.fixedUpdate(1/120);
  }, 1000/120);

  setInterval(function() {
    if (that.tanks.length) that.updateActiveTanks();
  }, 1000);

  setInterval(function() {
    that.showStats();
  }, 1000);
}

GameServer.prototype.init = function() {
  this.initSockets();
}

GameServer.prototype.createTank = function(socket) {
  var that = this
    , tank = { socket: socket, body: this.physics.addTank(), uuid: uuid.v4(), keys: {} };

  console.log('Adding tank with uuid: %s', tank.uuid);
  this.tanks.push(tank);

  socket.emit('init', { uuid: tank.uuid });

  socket.on('keyUp', function(key) {
    tank.keys[key] = false;
  });

  socket.on('keyDown', function(key) {
    tank.keys[key] = true;
  });

  /*
  socket.on('left', function() {
    that.physics.left(tank.body);
  });

  socket.on('right', function() {
    that.physics.right(tank.body);
  });

  socket.on('forward', function() {
    that.physics.forward(tank.body);
  });

  socket.on('reverse', function() {
    that.physics.reverse(tank.body);
  });
  */

  return tank;
}

GameServer.prototype.removeTank = function(tankToRemove) {
  var that = this;

  _.each(this.tanks, function(tank, idx) {
    if (tank.uuid == tankToRemove.uuid) {
      console.log('Removing tank with uuid: %s', that.tanks.splice(idx, 1)[0].uuid);
    }
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

GameServer.prototype.update = function(delta) {
  if (this.tanks.length) {
    this.io.sockets.emit('update', this.getUpdateObject());
  }
}

GameServer.prototype.fixedUpdate = function(delta) {
  if (this.physics && this.tanks.length) {
    this.physics.update(this.tanks, delta);
  }
}

GameServer.prototype.updateActiveTanks = function() {
  this.io.sockets.emit('activeTanks', _.pluck(this.tanks, 'uuid'));
}

GameServer.prototype.showStats = function() {
  console.log('%s - Tanks connected: %s', Date.now(), this.tanks.length);
}

module.exports = GameServer;

var _ = require('underscore')
  , Physics = require('./physics')
  , CANNON = require('../vendor/cannon');

function GameServer(io) {
  this.io = io;

  this.tanks = [];
  this.projectiles = [];

  this.physics = new Physics();

  var that = this;
  this.physics.on('projectile', function(projectile) {
    that.projectiles.push(projectile);
  });

  this.physics.on('kill', function(details) {
    that.io.sockets.emit('kill', details);
  });

  this.physics.on('activate', function(uuid) {
    that.io.sockets.emit('activate', uuid);
  });
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
    that.update(1/30);
  }, 1000/30);

  setInterval(function() {
    that.fixedUpdate(1/60);
  }, 1000/60);

  setInterval(function() {
    if (that.tanks.length) that.updateActiveTanks();
    if (that.tanks.length) that.updateActiveProjectiles();
  }, 1000);

  setInterval(function() {
    that.showStats();
  }, 1000);

  setInterval(function() {
    that.pruneOldProjectiles();
  }, 2000);
}

GameServer.prototype.init = function() {
  this.initSockets();
}

GameServer.prototype.createTank = function(socket) {
  var that = this
    , tank = this.physics.addTank();

  tank.socket = socket;

  console.log('Adding tank with uuid: %s', tank.uuid);
  this.tanks.push(tank);

  socket.emit('init', { uuid: tank.uuid });

  socket.on('keyUp', function(key) {
    tank.keys[key] = false;
  });

  socket.on('keyDown', function(key) {
    tank.keys[key] = true;
  });

  socket.on('fire', function() {
    if (tank.active) {
      tank.fire();
    } else {
      tank.active = true;
      that.physics.emit('activate', tank.uuid);
    }
  });

  return tank;
}

GameServer.prototype.removeTank = function(tankToRemove) {
  var that = this;

  _.each(this.tanks, function(tank, idx) {
    if (tank.uuid == tankToRemove.uuid) {
      that.physics.remove(tank);
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
    updateObj.tanks.push(tank.turretAngle);
    updateObj.tanks.push(tank.gunAngle);
  });

  _.each(this.projectiles, function(projectile) {
    updateObj.projectiles.push(projectile.uuid);
    updateObj.projectiles.push(projectile.shooter);
    updateObj.projectiles.push(projectile.body.position.x);
    updateObj.projectiles.push(projectile.body.position.y);
    updateObj.projectiles.push(projectile.body.position.z);
    updateObj.projectiles.push(projectile.body.quaternion.x);
    updateObj.projectiles.push(projectile.body.quaternion.y);
    updateObj.projectiles.push(projectile.body.quaternion.z);
    updateObj.projectiles.push(projectile.body.quaternion.w);
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

GameServer.prototype.updateActiveProjectiles = function() {
  this.io.sockets.emit('activeProjectiles', _.pluck(this.projectiles, 'uuid'));
}

GameServer.prototype.showStats = function() {
  console.log('%s - Tanks connected: %s Projectiles: %s', new Date(), this.tanks.length, this.projectiles.length);
}

GameServer.prototype.pruneOldProjectiles = function() {
  var that = this
    , time = Date.now();

  _.each(this.projectiles, function(projectile, idx) {
    if (projectile.timeShot < time - 2000) {
      that.physics.remove(projectile);
      that.projectiles.splice(idx, 1);
    }
  });
}

module.exports = GameServer;

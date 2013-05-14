require('bison');

var _ = require('underscore'),
    Tank = require('./actors/tank'),
    Projectile = require('./actors/projectile'),
    TouchControls = require('./controls/touch_controls'),
    GameMap = require('./game_map'),
    BISON = window.BISON;

var GameClient = window.VAPI.VeroldApp.extend({
  initialize: function() {
    this.tanks = [];
    this.projectiles = [];
  },

  defaultSceneLoaded: function(scene) {
    this.initSockets();

    //Bind to input events to control the camera
    this.veroldEngine.on('keyDown', this.onKeyDown, this);
    this.veroldEngine.on('keyUp', this.onKeyUp, this);
    this.veroldEngine.on('mouseUp', this.onMouseUp, this);
    this.veroldEngine.on('fixedUpdate', this.fixedUpdate, this );
    this.veroldEngine.on('update', this.update, this );

    if (window.VAPI.isMobile()) {
      this.touchControls = new TouchControls();
      this.touchControls.init();
      this.touchControls.callback = $.proxy(function(type, key) {
        if (type === 'down') {
          this.socket.emit('keyDown', key);
        } else  if (type === 'up') {
          this.socket.emit('keyUp', key);
        } else if (type === 'fire') {
          this.socket.emit('fire');
        }
      }, this);
    }

    //Store a pointer to the scene
    this.mainScene = scene;

    this.tankModel = this.mainScene.getObject('51446660ca7df102000009c0');
    this.bulletModel = this.mainScene.getObject('514b346d97481f020000020e');

    this.mainScene.removeChildObject(this.tankModel);
    this.mainScene.removeChildObject(this.bulletModel);

    this.map = new GameMap(scene);
    this.map.init();

    //Create the camera
    this.camera = new THREE.PerspectiveCamera( 70, this.getWidth() / this.getHeight(), 0.1, 10000 );
    this.camera.up.set( 0, 1, 0 );

    this.cameraControls = new THREE.OrbitControls(this.camera, $(this.el)[0]);

    //Tell the engine to use this camera when rendering the scene.
    this.setActiveCamera( this.camera );
  },

  defaultSceneProgress: function(scene) {
    var percent = Math.floor((scene.loadingProgress.loaded_hierarchy / scene.loadingProgress.total_hierarchy)*100);
    $('#loading-progress-container .loading-progress div').css({ width: percent + '%' });
  },

  initSockets: function() {
    var that = this;

    this.socket = window.io.connect();

    this.socket.on('kill', function(details) {
      _.each(that.tanks, function(tank) {
        if (tank.uuid === details.who && tank.active) {
          tank.setAsDestroyed();
        }
      });
    });

    this.socket.on('activate', function(uuid) {
      _.each(that.tanks, function(tank) {
        if (tank.uuid === uuid && !tank.active) {
          tank.setAsActive();
        }
      });
    });

    this.socket.on('map', function(map) {
      that.map.load(map);
    });

    this.socket.on('update', function(updateBSON) {
      var updateObject = BISON.decode(updateBSON);

      var processTank = function(tanks) {
        var update = tanks.splice(0,10), found = false;

        _.each(that.tanks, function(tank) {
          if (tank.uuid === update[0]) {
            found = true;
            tank.applyUpdate(update);
          }
        });

        if (!found) {
          var tank = new Tank(update[0], that.tankModel, that.mainScene);

          tank.init(function() {
            tank.applyUpdate(update);
            that.tanks.push(tank);
          });
        }
      };

      while (updateObject.tanks.length >= 9) {
        processTank(updateObject.tanks);
      }

      var processProjectile = function(projectiles) {
        var update = projectiles.splice(0,9),
            found = false;

        _.each(that.projectiles, function(projectile) {
          if (projectile.uuid === update[0]) {
            found = true;
            projectile.applyUpdate(update);
          }
        });

        if (!found) {
          var projectile = new Projectile(update[0], update[1], that.bulletModel, that.mainScene);

          projectile.init(function() {
            projectile.applyUpdate(update);
            that.projectiles.push(projectile);
          });
        }
      };

      while (updateObject.projectiles.length >= 8) {
        processProjectile(updateObject.projectiles);
      }
    });

    this.socket.on('connect', function() {
    });

    this.socket.on('activeTanks', function(activeTanks) {
      _.each(that.tanks, function(tank, idx) {
        if (!_.contains(activeTanks, tank.uuid)) {
          that.mainScene.threeData.remove(tank.object);
          that.tanks.splice(idx, 1);
        }
      });
    });

    this.socket.on('activeProjectiles', function(activeProjectiles) {
      _.each(that.projectiles, function(projectile, idx) {
        if (!_.contains(activeProjectiles, projectile.uuid)) {
          that.mainScene.threeData.remove(projectile.object);
          that.projectiles.splice(idx, 1);
        }
      });
    });

    this.socket.on('init', function(info) {
      var tank = new Tank(info.uuid, that.tankModel, that.mainScene, that.camera);

      tank.init(function() {
        tank.setAsActive();

        that.tank = tank;
        that.tanks.push(tank);
      });

    });
  },

  remove: function() {
    this.veroldApp.off('keyDown', this.onKeyDown, this);
    this.veroldApp.off('keyUp', this.onKeyUp, this);
    this.veroldApp.off('mouseUp', this.onMouseUp, this);
    this.veroldApp.off('update', this.update, this );
    window.VAPI.VeroldApp.remove.apply(this);
  },

  update: function() {
    if (this.tank) {
      this.tank.update();
    }

    if (this.cameraControls) {
      this.cameraControls.update();
    }
  },

  fixedUpdate: function() {
    if (this.tank) {
      this.tank.fixedUpdate();
    }
  },

  onKeyDown: function( event ) {
    var keyCodes = this.getInputHandler().keyCodes;
    if (event.keyCode === keyCodes.W) {
      this.socket.emit('keyDown', 'W');
    } else if (event.keyCode === keyCodes.A) {
      this.socket.emit('keyDown', 'A');
    } else if (event.keyCode === keyCodes.S) {
      this.socket.emit('keyDown', 'S');
    } else if (event.keyCode === keyCodes.D) {
      this.socket.emit('keyDown', 'D');
    } else if (event.keyCode === keyCodes.leftArrow) {
      this.socket.emit('keyDown', 'leftArrow');
    } else if (event.keyCode === keyCodes.rightArrow) {
      this.socket.emit('keyDown', 'rightArrow');
    } else if (event.keyCode === keyCodes.upArrow) {
      this.socket.emit('keyDown', 'upArrow');
    } else if (event.keyCode === keyCodes.downArrow) {
      this.socket.emit('keyDown', 'downArrow');
    }
  },

  onKeyUp: function( event ) {
    var keyCodes = this.getInputHandler().keyCodes;
    if (event.keyCode === keyCodes.W) {
      this.socket.emit('keyUp', 'W');
    } else if (event.keyCode === keyCodes.A) {
      this.socket.emit('keyUp', 'A');
    } else if (event.keyCode === keyCodes.S) {
      this.socket.emit('keyUp', 'S');
    } else if (event.keyCode === keyCodes.D) {
      this.socket.emit('keyUp', 'D');
    } else if (event.keyCode === keyCodes.leftArrow) {
      this.socket.emit('keyUp', 'leftArrow');
    } else if (event.keyCode === keyCodes.rightArrow) {
      this.socket.emit('keyUp', 'rightArrow');
    } else if (event.keyCode === keyCodes.upArrow) {
      this.socket.emit('keyUp', 'upArrow');
    } else if (event.keyCode === keyCodes.downArrow) {
      this.socket.emit('keyUp', 'downArrow');
    } else if (event.keyCode === keyCodes.space) {
      this.socket.emit('fire');
    }
  }
});

module.exports = GameClient;

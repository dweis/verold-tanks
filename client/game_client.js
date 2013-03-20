var Tank = require('./actors/tank')
  , TouchControls = require('./controls/touch_controls');

GameClient = function( veroldApp ) {

  this.veroldApp = veroldApp;  
  this.mainScene;
  this.camera;
  this.tank;
  this.socket;
  this.tanks = [];
}

GameClient.prototype.startup = function( ) {

  var that = this;

	this.veroldApp.loadScene( null, {
    
    success_hierarchy: function( scene ) {

      that.initSockets();

      // hide progress indicator
      that.veroldApp.hideLoadingProgress();

      that.inputHandler = that.veroldApp.getInputHandler();
      that.renderer = that.veroldApp.getRenderer();
      that.picker = that.veroldApp.getPicker();
      
      //Bind to input events to control the camera
      that.veroldApp.on('keyDown', that.onKeyDown, that);
      that.veroldApp.on('keyUp', that.onKeyUp, that);
      that.veroldApp.on('mouseUp', that.onMouseUp, that);
      that.veroldApp.on('fixedUpdate', that.fixedUpdate, that );
      that.veroldApp.on('update', that.update, that );

      if (that.veroldApp.isMobile()) {
        that.touchControls = new TouchControls(that.inputHandler.keyCodes);
        console.log(that.touchControls);
        that.touchControls.init();
      }

      //Store a pointer to the scene
      that.mainScene = scene;
      
      var models = that.mainScene.getAllObjects( { "filter" :{ "model" : true }});
      var model = that.model = models[ _.keys( models )[0] ];

      that.mainScene.removeChildObject(model);

      //Create the camera
      that.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
      that.camera.up.set( 0, 1, 0 );
      
      //Tell the engine to use this camera when rendering the scene.
      that.veroldApp.setActiveCamera( that.camera );

    },

    progress: function(sceneObj) {
      var percent = Math.floor((sceneObj.loadingProgress.loaded_hierarchy / sceneObj.loadingProgress.total_hierarchy)*100);
      that.veroldApp.setLoadingProgress(percent); 
    }
  });
	
}

GameClient.prototype.initSockets = function() {
  var that = this;

  this.socket = io.connect();

  this.socket.on('update', function(updateObject) {
    var c = 0;

    while (updateObject.tanks.length >= 7) {
      var update = updateObject.tanks.splice(0,8)
        , found = false;

      _.each(that.tanks, function(tank) {
        if (tank.uuid == update[0]) {
          found = true;
          tank.applyUpdate(update);
        }
      });

      if (!found) {
        var tank = new Tank(update[0], that.model, that.mainScene);

        tank.init(function() {
          tank.applyUpdate(update);
          that.tanks.push(tank);
        });
      }
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

  this.socket.on('init', function(info) {
    var tank = new Tank(info.uuid, that.model, that.mainScene, that.socket, that.inputHandler, that.camera);

    tank.init(function() {
      tank.setAsActive();

      that.tank = tank;
      that.tanks.push(tank);
    });

  });
}

GameClient.prototype.shutdown = function() {
  this.veroldApp.off('keyDown', this.onKeyDown, this);
  this.veroldApp.off('keyUp', this.onKeyUp, this);
  this.veroldApp.off('mouseUp', this.onMouseUp, this);

  this.veroldApp.off('update', this.update, this );
}

GameClient.prototype.update = function( delta ) {
  if (this.tank) {
    this.tank.update();
  }
}

GameClient.prototype.fixedUpdate = function( delta ) {
  if (this.tank) {
    this.tank.fixedUpdate();
  }
}

GameClient.prototype.onKeyDown = function( event ) {
	var keyCodes = this.inputHandler.keyCodes;
  if (event.keyCode === keyCodes['W']) {
    this.socket.emit('keyDown', 'W');
  } else if (event.keyCode === keyCodes['A']) {
    this.socket.emit('keyDown', 'A');
  } else if (event.keyCode === keyCodes['S']) {
    this.socket.emit('keyDown', 'S');
  } else if (event.keyCode === keyCodes['D']) {
    this.socket.emit('keyDown', 'D');
  }
}

GameClient.prototype.onKeyUp = function( event ) {
	var keyCodes = this.inputHandler.keyCodes;
  if (event.keyCode === keyCodes['W']) {
    this.socket.emit('keyUp', 'W');
  } else if (event.keyCode === keyCodes['A']) {
    this.socket.emit('keyUp', 'A');
  } else if (event.keyCode === keyCodes['S']) {
    this.socket.emit('keyUp', 'S');
  } else if (event.keyCode === keyCodes['D']) {
    this.socket.emit('keyUp', 'D');
  }
}

module.exports = GameClient;

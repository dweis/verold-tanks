var Tank = require('./actors/tank')
  , TouchControls = require('./controls/touch_controls');

GameClient = function( veroldApp ) {

  this.veroldApp = veroldApp;  
  this.mainScene;
  this.camera;
  this.tank;
  this.socket;
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
      that.veroldApp.on("keyDown", that.onKeyPress, that);
      that.veroldApp.on("mouseUp", that.onMouseUp, that);
      that.veroldApp.on("fixedUpdate", that.fixedUpdate, that );
      that.veroldApp.on("update", that.update, that );

      if (that.veroldApp.isMobile()) {
        that.touchControls = new TouchControls(that.inputHandler.keyCodes);
        console.log(that.touchControls);
        that.touchControls.init();
      }

      //Store a pointer to the scene
      that.mainScene = scene;
      
      var models = that.mainScene.getAllObjects( { "filter" :{ "model" : true }});
      var model = models[ _.keys( models )[0] ];

      that.mainScene.removeChildObject(model);

      //Create the camera
      that.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
      that.camera.up.set( 0, 1, 0 );
      
      var tank = new Tank(model, that.mainScene, that.socket, that.inputHandler, that.camera);

      tank.init(function() {
        console.log('DONE!');
        //tank.setAsDestroyed();
        tank.setAsActive();

        that.tank = tank;
      });

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
    that.tank.applyUpdate(updateObject.tanks.splice(0,8));
  });
}

GameClient.prototype.shutdown = function() {
  this.veroldApp.off("keyDown", this.onKeyPress, this);
  this.veroldApp.off("mouseUp", this.onMouseUp, this);

  this.veroldApp.off("update", this.update, this );
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

GameClient.prototype.onKeyPress = function( event ) {
	
	var keyCodes = this.inputHandler.keyCodes;
  if (event.keyCode === keyCodes['space'] ) {
    if (!this.tank.isActive()) {
      this.tank.setAsActive();
    } else {
      this.tank.setAsDestroyed();
    }
  }
}

module.exports = GameClient;

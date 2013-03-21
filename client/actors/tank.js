function Tank(uuid, template, scene, camera) {
  this.uuid = uuid;
  this.template = template;
  this.scene = scene;
  this.camera = camera;
  this.ready = false;
  this.active = false;

  this.tank = undefined;
  this.turret = undefined;
  this.gun = undefined;

  this.tankDestoyed = undefined;

  this.tmpVector3 = new THREE.Vector3();
  this.tmpQuaternion = new THREE.Quaternion();
}

Tank.prototype.init = function(callback) {
  var that = this;

  if (this.ready) return callback();

  this.template.clone({ success_hierarchy: function(instance) {
    that.scene.addChildObject(instance);
    that._initializeWithInstance(instance);
    callback();
  }});
}

Tank.prototype.setAsActive = function() {
  this.tank.visible = true;
  this.turret.visible = true;
  this.gun.visible = true;
  this.tankDestroyed.visible = false;
  this.active = true;

  if (this.camera) {
    this.camera.position.set( 0, 0.5, -1.5 );
    this.camera.lookAt(new THREE.Vector3(0,0.5,0));
  }
}

Tank.prototype.setAsDestroyed = function() {
  this.active = false;
  this.tankDestroyed.visible = true;
  this.tank.visible = false;
  this.turret.visible = false;
  this.gun.visible = false;

  this.camera.position.set( 0.5, 0.5, 1.5 );
  this.camera.lookAt(new THREE.Vector3(0,0,0));
}

Tank.prototype.isActive = function() {
  return this.active;
}

Tank.prototype.update = function() {
}

Tank.prototype.fixedUpdate = function() {
}

Tank.prototype._initializeWithInstance = function(instance) {
  var that = this;

  this.instance = instance;

  // Temporarily remove object, we'll create a new Object3D to attach it to
  this.scene.threeData.remove(instance.threeData);

  this.object = new THREE.Object3D();
  this.object.useQuaternion = true;
  this.object.position = new THREE.Vector3(0,0,0);
  this.object.add(this.instance.threeData);

  this.instance.threeData.position.y -= 0.1;

  //0.4,0.1,0.4
  var geometry = new THREE.CubeGeometry( 0.45, 0.2, 0.7 );
  var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
  var mesh = new THREE.Mesh( geometry, material );

  this.object.add(mesh);


  if (this.camera) {
    this.object.add(this.camera);
  }

  this.instance.traverse(function(obj) {
    var name = obj.entityModel.get('name');

    if (name.indexOf('TankDestroyed') == 0) {
      that.tankDestroyed = obj.threeData;
    } else if (name.indexOf('Tank') == 0) {
      that.tank = obj.threeData;
    } else if (name.indexOf('Turret') == 0) {
      that.turret = obj.threeData;
      that.turret.originalQuaternion = new THREE.Quaternion();
      that.turret.originalQuaternion.copy(that.turret.quaternion);
    } else if (name.indexOf('Gun') == 0) {
      that.gun = obj.threeData;
      that.gun.originalQuaternion = new THREE.Quaternion();
      that.gun.originalQuaternion.copy(that.gun.quaternion);
    }
  });

  this.scene.threeData.add(this.object);

  this.setAsActive();

  this.ready = true;
}

Tank.prototype.applyUpdate = function(update) {
  this.object.position.set(update[1], update[2], update[3]);
  this.object.quaternion.set(update[4], update[5], update[6], update[7]);

  this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), update[8]);
  this.turret.quaternion.copy(this.turret.originalQuaternion);
  this.turret.quaternion.multiply(this.tmpQuaternion);

  this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), update[9]);
  this.gun.quaternion.copy(this.gun.originalQuaternion);
  this.gun.quaternion.multiply(this.tmpQuaternion);
}

module.exports = Tank;

function Projectile(uuid, tankUuid, template, scene) {
  this.uuid = uuid;
  this.tankUuid = tankUuid;
  this.scene = scene;
  this.ready = false;
  this.active = false;
  this.template = template;
}

Projectile.prototype.init = function(callback) {
  var that = this;

  if (this.ready) return callback();

  this.template.clone({ success_hierarchy: function(instance) {
    that.scene.addChildObject(instance);

    that.object = new THREE.Object3D();
    that.object.useQuaternion = true;

    that.object.add(instance.threeData);

    /*
    var geometry = new THREE.CubeGeometry( 0.030, 0.030, 0.10 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );
    that.object.add(mesh);
    */

    that.scene.threeData.add(that.object);

    that.ready = true;

    return callback();
  }});
}

Projectile.prototype.update = function() {
}

Projectile.prototype.fixedUpdate = function() {
}

Projectile.prototype.applyUpdate = function(update) {
  this.object.position.set(update[2], update[3], update[4]);
  this.object.quaternion.set(update[5], update[6], update[7], update[8]);
}

module.exports = Projectile;

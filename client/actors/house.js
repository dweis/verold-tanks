function House(scene, template, entityData) {
  this.scene = scene;
  this.ready = false;
  this.template = template;
  this.object = new THREE.Object3D();
  this.object.useQuaternion = true;
  this.object.position.set(0,0.5,0);

  this.object.position.set(entityData.position.x, 0.5, entityData.position.z);
  this.object.quaternion.set(entityData.orientation.x, entityData.orientation.y,
      entityData.orientation.z, entityData.orientation.w);

}

House.prototype.init = function(callback) {
  var that = this;

  if (this.ready) {
    return callback();
  }

  this.template.clone({ success_hierarchy: function(instance) {
    that.scene.addChildObject(instance);

    that.object.add(instance.threeData);
    instance.threeData.position.set(0, -0.5, 0.15);

    /*
    var geometry = new THREE.CubeGeometry( 0.75, 1, 1.25 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,0,0);
    that.object.add(mesh);
   */

    that.scene.threeData.add(that.object);

    that.ready = true;

    return callback();
  }});
};

module.exports = House;

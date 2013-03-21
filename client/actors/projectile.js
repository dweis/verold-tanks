function Projectile(uuid, tankUuid, scene) {
  console.log('new projectile!');
  this.uuid = uuid;
  this.tankUuid = tankUuid;
  this.scene = scene;
  this.ready = false;
  this.active = false;
}

Projectile.prototype.init = function(callback) {
  var that = this;

  if (this.ready) return callback();

  this.object = new THREE.Object3D();
  this.object.useQuaternion = true;

  var geometry = new THREE.CubeGeometry( 0.05, 0.05, 0.15 );
  var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
  var mesh = new THREE.Mesh( geometry, material );

  this.object.add(mesh);

  this.scene.threeData.add(this.object);

  this.ready = true;

  return callback();
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

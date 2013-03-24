var House = require('./actors/house');

function Map(scene) {
  this.scene = scene;

  this.houseModel = undefined;

  this.entities = [];
}

Map.prototype.init = function() {
  this.houseModel = this.scene.getObject('514b3b99b255f90200000214');
  this.houseModel.threeData.position.x = 0;
  this.scene.removeChildObject(this.houseModel);
}

Map.prototype.load = function(mapData) {
  var that  = this;

  console.log('MAP:', mapData);

  _.each(mapData.entities, function(entity) {
    var entityObject;

    if (entity.type == 'house') {
      entityObject = new House(that.scene, that.houseModel, entity);

      entityObject.init(function() {
        that.entities.push(entityObject);
      });
    }
  });
}

module.exports = Map;

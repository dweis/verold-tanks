var _ = require('underscore'),
    House = require('./actors/house');

function GameMap(scene) {
  this.scene = scene;

  this.houseModel = undefined;

  this.entities = [];
}

GameMap.prototype.init = function() {
  this.houseModel = this.scene.getObject('514b3b99b255f90200000214');
  this.houseModel.threeData.position.x = 0;
  this.scene.removeChildObject(this.houseModel);
};

GameMap.prototype.load = function(mapData) {
  var that  = this;

  console.log('MAP:', mapData);

  _.each(mapData.entities, function(entity) {
    var entityObject;

    if (entity.type === 'house') {
      entityObject = new House(that.scene, that.houseModel, entity);

      entityObject.init(function() {
        that.entities.push(entityObject);
      });
    }
  });
};

module.exports = GameMap;

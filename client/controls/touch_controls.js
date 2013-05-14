/* global GameController */

function TouchControls(callback) {
  this.callback = callback;
}

TouchControls.prototype.init = function() {
  var that = this;

  var div = $('<div>', { style: 'position: absolute; left: 50%; top: 50%; margin-left: -100px; margin-top: -100px; width: 200px; height: 200px; z-index: 10' }).appendTo('body');

  $(div).click(function() {
    that.callback('fire');
  });

  GameController.init({
    left: {
      type: 'dpad',
      position: { left: '10%' },
      dpad: {
        up: {
          touchStart: function() {
            that.callback('press', 'W');
            that.callback('down', 'W');
          },
          touchEnd: function() {
            that.callback('up', 'W');
          }
        },
        down: {
          touchStart: function() {
            that.callback('press', 'S');
            that.callback('down', 'S');
          },
          touchEnd: function() {
            that.callback('up', 'S');
          }
        },
        left: {
          touchStart: function() {
            that.callback('press', 'A');
            that.callback('down', 'A');
          },
          touchEnd: function() {
            that.callback('up', 'A');
          }
        },
        right: {
          touchStart: function() {
            that.callback('press', 'D');
            that.callback('down', 'D');
          },
          touchEnd: function() {
            that.callback('up', 'D');
          }
        }
      }
    },
    right: {
      type: 'dpad',
      position: { right: '20%' },
      dpad: {
        up: {
          touchStart: function() {
            that.callback('press', 'upArrow');
            that.callback('down', 'upArrow');
          },
          touchEnd: function() {
            that.callback('up', 'upArrow');
          }
        },
        down: {
          touchStart: function() {
            that.callback('press', 'downArrow');
            that.callback('down', 'downArrow');
          },
          touchEnd: function() {
            that.callback('up', 'downArrow');
          }
        },
        left: {
          touchStart: function() {
            that.callback('press', 'leftArrow');
            that.callback('down', 'leftArrow');
          },
          touchEnd: function() {
            that.callback('up', 'leftArrow');
          }
        },
        right: {
          touchStart: function() {
            that.callback('press', 'rightArrow');
            that.callback('down', 'rightArrow');
          },
          touchEnd: function() {
            that.callback('up', 'rightArrow');
          }
        }
      }
    }
  });
};

module.exports = TouchControls;

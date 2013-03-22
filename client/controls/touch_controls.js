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
          touchStart: function(details) {
            that.callback('press', 'W');
            that.callback('down', 'W');
          },
          touchEnd: function(details) {
            that.callback('up', 'W');
          }
        },
        down: {
          touchStart: function(details) {
            that.callback('press', 'S');
            that.callback('down', 'S');
          },
          touchEnd: function(details) {
            that.callback('up', 'S');
          }
        },
        left: {
          touchStart: function(details) {
            that.callback('press', 'A');
            that.callback('down', 'A');
          },
          touchEnd: function(details) {
            that.callback('up', 'A');
          }
        },
        right: {
          touchStart: function(details) {
            that.callback('press', 'D');
            that.callback('down', 'D');
          },
          touchEnd: function(details) {
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
          touchStart: function(details) {
            that.callback('press', 'upArrow');
            that.callback('down', 'upArrow');
          },
          touchEnd: function(details) {
            that.callback('up', 'upArrow');
          }
        },
        down: {
          touchStart: function(details) {
            that.callback('press', 'downArrow');
            that.callback('down', 'downArrow');
          },
          touchEnd: function(details) {
            that.callback('up', 'downArrow');
          }
        },
        left: {
          touchStart: function(details) {
            that.callback('press', 'leftArrow');
            that.callback('down', 'leftArrow');
          },
          touchEnd: function(details) {
            that.callback('up', 'leftArrow');
          }
        },
        right: {
          touchStart: function(details) {
            that.callback('press', 'rightArrow');
            that.callback('down', 'rightArrow');
          },
          touchEnd: function(details) {
            that.callback('up', 'rightArrow');
          }
        }
      }
    }
  });
}

module.exports = TouchControls;

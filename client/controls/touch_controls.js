function TouchControls(keySet) {
  this.keySet = keySet;
}

TouchControls.prototype.init = function() {
  var that = this;

  GameController.init({
    left: {
      type: 'dpad',
      dpad: {
        up: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['W']);
            GameController.simulateKeyEvent('down', that.keySet['W']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['W']);
          }
        },
        down: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['S']);
            GameController.simulateKeyEvent('down', that.keySet['S']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['S']);
          }
        },
        left: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['A']);
            GameController.simulateKeyEvent('down', that.keySet['A']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['A']);
          }
        },
        right: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['D']);
            GameController.simulateKeyEvent('down', that.keySet['D']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['D']);
          }
        }
      }
    },
    right: {
      type: 'dpad',
      dpad: {
        up: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['upArrow']);
            GameController.simulateKeyEvent('down', that.keySet['upArrow']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['upArrow']);
          }
        },
        down: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['downArrow']);
            GameController.simulateKeyEvent('down', that.keySet['downArrow']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['downArrow']);
          }
        },
        left: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['leftArrow']);
            GameController.simulateKeyEvent('down', that.keySet['leftArrow']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['leftArrow']);
          }
        },
        right: {
          touchStart: function(details) {
            GameController.simulateKeyEvent('press', that.keySet['rightArrow']);
            GameController.simulateKeyEvent('down', that.keySet['rightArrow']);
          },
          touchEnd: function(details) {
            GameController.simulateKeyEvent('up', that.keySet['rightArrow']);
          }
        }
      }
    }
  });
}

module.exports = TouchControls;

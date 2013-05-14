var GameClient = require('./game_client');

var gameClient = new GameClient({
  projectId: '51446324ca7df102000009b4',
  el: '#render-target-container',
  engineOptions: {
    enablePostProcess: false,
    enablePicking: false,
    handleInput: true,
    clearColor: 0xff0000
  }
});

gameClient.run();

module.exports = window.gameClient = gameClient;

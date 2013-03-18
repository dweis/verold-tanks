var _ = require('underscore')
  , VeroldApp = require('../vendor/verold/VeroldApp')
  , GameClient = require('./game_client');

var veroldApp = new VeroldApp()
  , gameClient = new GameClient(veroldApp);

$(function() {
  VAPI.onReady(function() {
    veroldApp.initialize( {
      container : null,
      projectId : "51446324ca7df102000009b4",
      enablePostProcess: false,
      enablePicking: false,
      handleInput: true,
      clearColor: 0xff0000,
      success: function() {
        gameClient.startup();
      }
    });
  });
});

module.exports = window.gameClient = gameClient;

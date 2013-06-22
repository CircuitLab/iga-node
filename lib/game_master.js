
/**
 * Module dependencies.
 */

var fs = require('fs')
  , request = require('request')
  , mime = require('mime')
  , location = require('../config').location
  , env = require('../lib/env');

function GameMaster(io) {
  this.io = io;

  this.players = {};
  this.games = {};
  this.listener = location.hostname;
  this.profile_images = location.profile_images;
}

GameMaster.prototype.welcomePlayer = function(socket, user) {
  var self = this;

  user || (user = {});

  if (!user.profile_image_url) {
    var profile_image_url = this.profile_images + 'default.jpeg';

    user.profile_image_url = profile_image_url;
    self.io.of('/game').emit('enter', socket.id, profile_image_url);
  } else {
    request({ url: user.profile_image_url, encoding: null }, function(err, res, body) {
      var ext = mime.extension(res.headers['content-type'])
        , path_to_profiles = (env == 'development') ? './public/images/profiles/' : '../public/images/profiles/'
        , filename = socket.id + '.' + ext;

      fs.mkdir(path_to_profiles, function(err) {
        fs.writeFile(path_to_profiles + filename, body, function(err) {
          self.io.of('/game').emit('enter', socket.id, self.profile_images + filename);
        });
      });
    });
  }

  this.players[socket.id] = user;
};

GameMaster.prototype.throwDetonator = function(socket, user_id) {
  if (this.players[socket.id].profile_image_url) {
    this.io.of('/game').emit('shake', socket.id);
  }
};

GameMaster.prototype.farewellPlayer = function(socket) {
  if (this.players[socket.id]) delete this.players[socket.id];
  this.io.of('/game').emit('leave', socket.id);
};

GameMaster.prototype.createGame = function(socket) {
  this.games[socket.id] = socket;
};

GameMaster.prototype.destroyGame = function(socket) {
  if (socket && this.games[socket.id]) delete this.games[socket.id];
}

module.exports = GameMaster;

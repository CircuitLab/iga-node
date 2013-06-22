
/**
 * Module dependencies.
 */

var fs = require('fs')
  , request = require('request')
  , mime = require('mime')
  , osc = require('osc-min');

function User() {
  this.users = {};
}

User.prototype.enter = function(socket, user) {
  user || (user = {});

  if (!user.profile_image_url) {
    user.profile_image_url = './public/images/profiles/default.jpeg';
  } else {
    request({ url: user.profile_image_url, encoding: null }, function(err, res, body) {
      var ext = mime.extension(res.headers['content-type'])
        , filename = socket.id + '.' + ext;

      fs.writeFile('./public/images/profiles/' + filename, body, function() {
        // sendOSCenter(socket.id, filename);
      });
    });
  }

  this.users[socket.id] = user;
};

User.prototype.shake = function(socket, user_id) {
  if (this.users[socket.id].profile_image_url) {
    // sendOSCshake(socket.id);
  }
};

User.prototype.leave = function(socket) {
  if (this.users[socket.id]) delete this.users[socket.id];
  // sendOSCleave(socket.id);
};

module.exports = new User();
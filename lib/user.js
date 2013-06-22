
/**
 * Module dependencies.
 */

var fs = require('fs')
  , request = require('request')
  , mime = require('mime')

function User() {
  this.users = {};
}

User.prototype.enter = function(socket, user) {
  this.users[socket.id] = user;

  if (!user.profile_image_url) user.profile_image_url = './public/images/profiles/default.jpeg';

  request({ url: user.profile_image_url, encoding: null }, function(err, res, body) {
    var ext = mime.extension(res.headers['content-type'])
      , filename = socket.id + '.' + ext;

    fs.writeFile('./public/images/profiles/' + filename, body, function() {
      // sendOSCenter(socket.id, filename);
    });
  });
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
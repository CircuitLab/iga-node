
/**
 * Module dependencies.
 */

var fs = require('fs')
  , request = require('request')
  , mime = require('mime')
  , dgram = require('dgram')
  , osc = require('osc-min')
  , location = require('../config').location;

function User() {
  this.users = {};
  this.sender = dgram.createSocket('udp4');
  this.listener = location.hostname;
  this.profile_images = location.profile_images;

  this.sender.bind(5001);
  this.sender.on('message', function(msg, rinfo) {
    return console.log(osc.fromBuffer(msg));
  });
}

User.prototype.enter = function(socket, user) {
  var self = this
    , path_to_profiles = './public/images/profiles/';

  user || (user = {});

  if (!user.profile_image_url) {
    var filename = path_to_profiles + 'default.jpeg';

    user.profile_image_url = filename;
    self.sendOSCenter(socket.id, filename);
  } else {
    request({ url: user.profile_image_url, encoding: null }, function(err, res, body) {
      var ext = mime.extension(res.headers['content-type'])
        , filename = socket.id + '.' + ext;

      fs.mkdir(path_to_profiles, function(err) {
        fs.writeFile(path_to_profiles + filename, body, function(err) {
          self.sendOSCenter(socket.id, filename);
        });
      });
    });
  }

  this.users[socket.id] = user;
};

User.prototype.shake = function(socket, user_id) {
  if (this.users[socket.id].profile_image_url) {
    this.sendOSCshake(socket.id);
  }
};

User.prototype.leave = function(socket) {
  if (this.users[socket.id]) delete this.users[socket.id];
  this.sendOSCleave(socket.id);
};

User.prototype.sendOSCenter = function(socket_id, filename) {
  var buf = osc.toBuffer({
    address: '/enter',
    args: [socket_id, this.profile_images + filename]
  });

  this.sender.send(buf, 0, buf.length, 5000, this.listener);
};

User.prototype.sendOSCshake = function(socket_id){
  var buf = osc.toBuffer({
    address: '/shake',
    args: socket_id
  });

  this.sender.send(buf, 0, buf.length, 5000, this.listener);
};

User.prototype.sendOSCleave = function(socket_id) {
  var buf = osc.toBuffer({
    address: 'leave',
    args: [socket_id]
  });

  this.sender.send(buf, 0, buf.length, 5000, this.listener);
};

module.exports = new User();
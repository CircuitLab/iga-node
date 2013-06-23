$(document).ready(function() {

  var socket = io.connect('/game');

  // setTimeout(function() {
  //   unity.SendMessage('OSCcontroller', 'oscEnter', 'aaa' + '&' + 'http://localhost:3000/images/profiles/default.jpeg');
  // }, 10000);

  // setInterval(function() {
  //   unity.SendMessage('OSCcontroller', 'shakeDetonator', 'aaa');
  // }, 15000);

  // setTimeout(function() {
  //   unity.SendMessage('OSCcontroller', 'leavePlayer', 'aaa');
  // }, 20000);

  socket.on('enter', function(id, profile_image) {
    u.getUnity().SendMessage('OSCcontroller', 'oscEnter', id + '&' + profile_image);
  });

  socket.on('shake', function(id) {
    u.getUnity().SendMessage('OSCcontroller', 'shakeDetonator', id);
  });

  socket.on('leave', function(id) {
    u.getUnity().SendMessage('OSCcontroller', 'leavePlayer', id);
  });

  window.ThankYou = function() {
    console.log('Thank You!');
    socket.emit('thank');
  };

});

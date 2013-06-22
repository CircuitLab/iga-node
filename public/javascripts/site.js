$(document).ready(function() {

  var socket = io.connect()
    , user = $('#user').data('user')
    , duration = 500
    , ready = true;

  socket.emit('enter', user);

  window.addEventListener('shake', function(e) {
    if (!ready) return false;

    socket.emit('shake', user.id);
    ready = false;
    setTimeout(function() { ready = true }, duration);
  }, false);

  $(window).on('unload', function() {
    socket.emit('leave', user.id);
  });

});

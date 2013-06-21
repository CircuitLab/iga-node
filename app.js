
/**
 * Module dependencies.
 */

var debug = require('debug')('dh:app')
  , fs = require('fs')
  , http = require('http')
  , path = require('path')
  , dgram = require('dgram')
  , osc = require('osc-min')
  , base64id = require('base64id')
  , request = require('request')
  , mime = require('mime')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , express = require('express')
  , sio = require('socket.io')
  , routes = require('./routes');

var app = express()
  , server = module.exports = http.createServer(app)
  , sender = dgram.createSocket('udp4')
  , listener = process.env.HOST || 'diehard1.local'
  , io = sio.listen(server);

var online = 0;
var mode = "stanby";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new TwitterStrategy({
    consumerKey: 'kmiPJOIco0RI5WA6oDOmQ'
  , consumerSecret: '57yaZi1garPxtwd8GzEenEwltITIzgXbeecxIOqA'
  , callbackURL: 'http://' + listener + ':3000/auth/twitter/callback'
}, function(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

passport.use(new FacebookStrategy({
    clientID: '200682010056928',
    clientSecret: 'db00b78cb1d46e810d036a8a11be5cdb',
    callbackURL: 'http://' + listener + ':3000/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
      return done(null, profile);
    });
}));

sender.bind(5001);

sender.on('message', function(msg, rinfo) {
  console.log(arguments);
});

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ secret:'keyboard cat'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/profiles', express.static(path.join(__dirname, 'var/images')));
});

app.locals.title = 'Smartphone Bomb Prototype';

app.configure('development', function() {
  app.use(express.errorHandler());
});

io.sockets.on('connection', function(socket) {
  
  io.sockets.emit('message', { message: mode  });
  io.sockets.emit('onlineNum', { online: online });
  
  socket.on('enter', function(user) {
    ++online;
    io.sockets.emit('onlineNum', { online: online });

    var image_url;
    if (user.profile_image_url != null) {
      image_url = user.profile_image_url; //twitter
    } else {
      image_url = 'https://graph.facebook.com/' + user.username + '/picture'; //facebook
    } 
    request({ url: image_url, encoding: null }, function(err, res, body) {
      var filename
        , ext = mime.extension(res.headers['content-type']);

      filename = socket.id + '.' + ext;

      fs.writeFile('./var/images/' + filename, body, function() {
        sendOSCenter(socket.id, filename);

        socket.on('shake', function() {
          sendOSCshake(socket.id);
        });

        /*
        socket.on('move', function(x, y) {
          var buf = osc.toBuffer({
              address: '/move'
            , args: [socket.id, x, y]
          });
          console.log(x, y);
          sender.send(buf, 0, buf.length, 5000, listener);
        });
        */

        socket.on('leave', function(user) {
          var buf = osc.toBuffer({
              address: 'leave'
            , args: [socket.id]
          });
          sender.send(buf, 0, buf.length, 5000, listener);
        });

        socket.on('disconnect',function(){
          --online;
          io.sockets.emit('onlineNum', { online: online });
        });

      });
    });
  });

  socket.on('mode', function(data) {
    mode = data;
   var buf = osc.toBuffer({
              address: '/mode'
            , args: mode
   });
   debug('mode %s', data);
   sender.send(buf, 0, buf.length, 5000, listener);
   io.sockets.emit('message', { message: mode });
   io.sockets.emit('mode', { mode: mode });
  });

  socket.on('randosc', function(data) {
    while( data > 0 ){
      data--;
      var files = fs.readdirSync('var/images');
      var filename = files[Math.floor( Math.random() * (files.length-1) )];
      var randid = filename.split(".");
      if(randid[0]==""){
        break;
      }
      debug('randfilename %s', randid[0]);
      sendOSCenter(randid[0],filename);
      sendOSCshake(randid[0]);
    }
  });

  socket.on('randunity', function() {
    debug('unity auto');
    var buf = osc.toBuffer({ address: '/auto' });
    
    sender.send(buf, 0, buf.length, 5000, listener);
  });

  socket.on('status_admin', function(data) {
    io.sockets.emit( 'status', data )
  });

  socket.on('charge_speed_admin', function(data) {
    io.sockets.emit( 'charge_speed', data )
  });

});

function sendOSCenter(id,file){
  var buf = osc.toBuffer({
    address: '/enter',
    args: [id, 'http://localhost:3000/profiles/' + file]
    // args: [socket.id, 'http://' + listener + ':3000/profiles/' + filename]
  });
  debug('enter %s', id);
  sender.send(buf, 0, buf.length, 5000, listener);
}

function sendOSCshake(id){
   var buf = osc.toBuffer({
      address: '/shake',
      args: id
   });
   debug('shaken %s', id);
   sender.send(buf, 0, buf.length, 5000, listener);
}

//route
app.get('/', routes.index);

app.get('/auth/twitter'
  , passport.authenticate('twitter')
  , function(req, res) {
    });

app.get('/auth/twitter/callback'
  , passport.authenticate('twitter', { failureRedirect: '/login' })
  , function(req, res) {
      res.redirect('/shake');
    });
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' })
   , function(req, res) {
      res.redirect('/shake');
    });

app.get('/shake', function(req, res) {
  if (!req.user) {
    return res.redirect('/');
  }
  res.render('shake', { user: req.user._json });
});

app.get('/admin', function(req, res) {
  res.render('admin',  { title: 'Smartphone Bomb Prototype' });
});

server.listen(app.get('port'), function() {
  debug("Express server listening on port " + app.get('port'));
});

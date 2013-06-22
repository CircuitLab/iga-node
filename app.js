
/**
 * Module dependencies.
 */

var express = require('express')
  , path = require('path')
  , http = require('http')
  , sio = require('socket.io')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , twitterCredits = require('./config').twitter
  , routes = require('./routes')
  , GameMaster = require('./lib/game_master');

var app = express()
  , server = http.createServer(app)
  , io = sio.listen(server)
  , gameMaster = new GameMaster(io);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy(twitterCredits, function(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

io.of('/player').on('connection', function(socket) {

  socket.on('enter', function(user) {
    gameMaster.welcomePlayer(socket, user);
  });

  socket.on('shake', function(user_id) {
    gameMaster.throwDetonator(socket, user_id);
  });

  socket.on('leave', function() {
    gameMaster.farewellPlayer(socket);
  });

  socket.on('disconnect', function() {
    gameMaster.farewellPlayer(socket);
  });
});

io.of('/game').on('connection', function(socket) {
  gameMaster.createGame(socket);

  socket.on('disconnect', function() {
    gameMaster.destroyGame(socket);
  });
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


(function() {

  var socket = io.connect()
    , user_agent = ""
    , mode = 0
    , status = "enable"
    , throw_state = "charge"
    , charge = 100
    , timer_speed = 4;

  window.addEventListener('DOMContentLoaded', function(e) {
    var user;
    var options;
    
    try{
      user = JSON.parse(document.querySelector('#user').dataset.user)
    }catch(e){
          //alert(e); 
    }
    //console.log(user);
    socket.emit('enter', user);
    
    var image_url;
    if(user.profile_image_url != null) {
        image_url = user.profile_image_url; //twitter
    } else {
        image_url = 'https://graph.facebook.com/' + user.username + '/picture'; //facebook
    }
    //$("#header").append($ ("<img src=" + image_url + " width='50' height='50' >")); 
    window.addEventListener('shake', function(e) {
      if( "ready" == throw_state ) {
        document.body.style.backgroundColor = 'black';
        socket.emit('shake', user.id);
        setTimeout(function() {
          document.body.style.backgroundColor = 'black';
          throw_state = "charge";
          charge = 100;
          charge_timer();
        }, 500);
      }
    }, false);

    /*
    document.addEventListener('touchmove', function(e) {
      console.log(e.touches);
      var x = (e.touches[0].offsetX - (document.width / 2)) / document.width * 2
        , y = (e.touches[0].offsetY - (document.height / 2)) / document.height * 2;
      socket.emit('move', x, y);
    });
    */

    document.addEventListener('unload', function(e) {
      socket.emit('leave', user);
    });

  });

//////////Socket.IO protocol from server

  socket.on("mode",function(data) {
    var modeArg = data.mode;
    switch( modeArg ) {
      case 'standby':
        mode = 0;
        break;
      case 'ready':
        mode = 1;
        break;
      case 'test':
        mode = 2;
        break;
      case 'on':
        mode = 3;
        break;
      default:
        break;
    }
    console.log( mode );
  });

  // socket.on("message",function(data) {
  //   var message = data.message;
  //   $("#message").text("status: " + message); 
  //   console.log(data.message)  ;
  // });

  socket.on("status",function(data) {
    status = data.status;
    console.log( data );
  });

  socket.on("charge_speed",function(data) {
    timer_speed = data.charge_speed;
    console.log( data );
  });

///////////////////charge timer function
  
  charge_timer = function(){
    charge --;
    if( charge <= 0 ) {
      charge = 0;
      throw_state = "ready";
    };
    //console.log(charge);
    if ( "charge" == throw_state ){ 
      setTimeout( 'charge_timer()', timer_speed );
    }
  };

////////////Processing shared variables
  $(function(){
    jQuery(function($) {
      $('canvas').processing({
          onSetup: function() {
            $(this).data('p5-deferred').done(function(Scketch,Processing) {
              var p5 = Processing;
              p5.setStageSize( window.innerWidth, window.innerHeight );
              p5.setUa( user_agent );
              p5.setMode( mode );
              p5.setStatus( status );
              p5.setCharge( charge );
            });
            charge_timer(); //start timer
          }
        , onFrameStart: function() {
          var p5 = $(this).data('p5-instance')
            , sketch = $(this).data('p5-sketch');
            p5.setMode( mode );
            p5.setStatus( status );
            p5.setCharge( charge );
            // callback before draw()
          }
        , onFrameEnd: function() {
            // callback after draw()
          }
        , onPause: function() {
            // callback on loop is paused
          }
        , onLoop: function() {
            // callback on loop is resumed or started
          }
      });
    });
    
    window.fbAsyncInit = function() { 
      FB.init({appId: "444140932320063", status: true, cookie: true, xfbml: true});  
    };

    /*$('.postTW' ).click( function() {
      var text = ""
        , myUrl = "moxus.local:3000";
      // $.post('http://api.twitter.com/1/statuses/update.json', { status: text },  function( res ) {
      //     console.log( res );
      //  }).error( function ( erorr ){
      //     console.log( erorr );
      //  });
      var urlTW = "https://twitter.com/intent/tweet?text=" + text + "&url=" + myUrl;
      window.open(urlTW, "", "toolbar=0, status=0, width=650, height=360");
    });

    $('.postFB' ).click( function() {
      // calling the API ...
      var obj = {
        method: 'feed',
        redirect_uri: 'http://moxus.local:3000',
        link: 'http://www.youtube.com/watch?v=FRLwoMXaZHQ',
        picture: 'http://fbrell.com/f8.jpg',
        name: 'DIEHARD5',
        caption: 'DIEHARD5 BOMB APP',
        description: 'DIEHARD5テストアプリから'
      };

      function callback(response) {
        document.getElementById('msg').innerHTML = "Post ID: " + response['post_id'];
      }
      console.log(obj)
      FB.ui(obj, callback);
    });*/

  });

}).call(this);

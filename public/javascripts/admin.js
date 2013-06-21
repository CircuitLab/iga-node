$(function() {
  var socket = io.connect()
    , charge_speed = 100;
  
  socket.on("onlineNum",function(data){
    var  onlineNum = data.online;
    $("#online").text("online: " + onlineNum);   
  })
  
  $(".randosc").click(function () {
    socket.emit('randosc',1);
    console.log("rand");
  });
  $(".randunity").click(function () {
    socket.emit('randunity');
    console.log("unity");
  });

  $('input[name="mode"]:radio' ).change( function() {  
    socket.emit('mode',$(this).val());
    console.log( $( this ).val());
  });  

  $(".range01").change( function() { 
    $(".showRangeArea").text($(this).val());
    socket.emit('randosc',$(this).val());
    console.log($(this).val());
  });


  $(".range02").change( function() { 
    $(".showRangeArea2").text($(this).val());
    socket.emit('randunity',$(this).val());
    console.log($(this).val());

  });

  $('.status_enable' ).click( function() {
    socket.emit('status_admin', { status: "enable" } );
    $(".showStatusArea").text( "enable" );
    console.log( "status enable" );
  }); 

  $('.status_disable' ).click( function() {
    socket.emit('status_admin', { status: "disable" } );
    $(".showStatusArea").text( "disable" );
    console.log( "status disable" );
  }); 

  $('.submit_speed' ).click( function() {  
    socket.emit('charge_speed_admin', { charge_speed: charge_speed} );
    console.log( "charge_speed : " +  charge_speed );
    $(".showCharge_speedArea").text( charge_speed + " ms" );
  }); 

  $(".charge_speed_range").change( function() { 
    charge_speed = $(this).val();
    $(".showCharge_speedArea").text( $(this).val() + " ms");

  });

});

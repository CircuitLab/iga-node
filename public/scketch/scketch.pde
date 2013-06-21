///// DIEHARD 5 Processing code /////
////////// Uniba Inc. 2013 //////////

////////////////shareed variables
Object userAgent;
Object mode;
Object charge;
Object current_status;
Object message;
////////////////////////////////

int     stageWidth          = 640;
int     stageHeight         = 960;

PImage test_grenade_rest;
PImage test_grenade_ready;
PImage test_grenade_success;

void setup() {
	size(stageWidth, stageHeight);
	frameRate( 60 );

	//test_grenade = loadImage("images/test_grenade.png");
	test_grenade_rest = loadImage("images/shake/bomb_standby.jpg");
	test_grenade_ready = loadImage("images/shake/bomb_ready.jpg");
	test_grenade_success = loadImage("images/shake/bomb_shaked.jpg");
}

void draw() {
    int image_margine = stageWidth - 60;
	background(0);
	
	/////////////////////////////grenade image
	if( "enable" == current_status && 0 >= charge ){
    	image( test_grenade_ready, 0, 320, 960, 486 );
    } else {
        image( test_grenade_rest, 0, 320, 960, 486 );
    }
    
	switch( mode ){
	    case 0: //standby
	        fill( 0, 255, 255 );
	        break;
	    case 1: //ready
	        fill( 255, 255, 0 );
	        break;
	    case 2: //test
	        fill( 0, 0, 255 );
	        break; 
	    case 3: //on
	        fill( 255, 0, 0 );
	        break
	    default:
	        break;
	}
	
	rect( 30,  stageHeight - 240, 50, 50 );
	
	if( "disable" == current_status ){
	    fill( 0, 0, 0 , 130);
	    rect( 0, 0, stageWidth, stageHeight );
	}
	//////////////////////////charge gage graph
	if( "enable" == current_status ){
	    fill( 255, 0, 0 );
	    rect( 30, stageHeight - 160, image_margine * ( 100 - charge ) * 0.01 , 120 );
    }
	
	
	/////////////////////////////// debug text
	
	fill( 0 );
	text( "current mode: " + mode, 30, 30 );
	text( "current status: " + current_status, 30, 50 );
	text( "charge: " + charge, 30, 70 );
	
    /*println(mode);
    println(charge);
    println(current_status);*/
}


/////// method for API ///////////

void setMode(Object _mode) {
  mode = _mode;
}

void setUa(Object obj) {
  userAgent = obj;
}

void setCharge(Object _charge) {
　　charge　= _charge;
}

void setStatus(Onject _status) {
　　current_status　= _status;
}

void setMessage(Object _message) {
　　message = _message;
}

void setStageSize(int w, int h) {
  stageWidth = w;
  stageHeight = h;
  size( w, h );
}
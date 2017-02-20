/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebAudio() {

	var context = new AudioContext();
	var source, buffer;

	var startAt = 0;
	var paused = true;

	function load( url ) {

		var request = new XMLHttpRequest();
		request.open( 'GET', url, true );
		request.responseType = 'arraybuffer';
		request.addEventListener( 'load', function ( event ) {
			context.decodeAudioData( event.target.response, function ( data ) {
				buffer = data;
			} );
		} );
		request.send();

	}

	function play() {

		if ( paused === false ) return;
		if ( buffer === undefined ) return; // TODO

		source = context.createBufferSource();
		source.buffer = buffer;
		source.start();
		source.connect( context.destination );

		startAt = context.currentTime;
		paused = false;

	}

	function pause() {

		if ( paused === true ) return;

		source.stop();
		source.disconnect( context.destination );

		paused = true;

	}

	return {
		play: play,
		pause: pause,
		get currentTime() {
			if ( paused === true ) return 0;
			return context.currentTime - startAt;
		},
		set currentTime( value ) {
			context.currenTime = value;
		},
		set src( url ) {
			load( url );
		},
		get paused() {
			return paused;
		}
	}

}

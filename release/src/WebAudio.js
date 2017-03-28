/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebAudio() {

	var context = new AudioContext();
	var source, buffer;

	var currentTime = 0;
	var loop = false;
	var playbackRate = 1;

	var paused = true;
	var startAt = 0;

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

	function getCurrentTime() {

		return currentTime + ( context.currentTime - startAt ) * playbackRate;

	}

	function play() {

		if ( buffer === undefined ) return false;

		source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = loop;
		source.playbackRate.value = playbackRate;
		source.start( 0, currentTime );
		source.connect( context.destination );

		startAt = context.currentTime;

		return true;

	}

	function stop() {

		source.stop();
		source.disconnect( context.destination );

		currentTime = getCurrentTime();

		return true;

	}

	return {
		play: function () {
			if ( paused ) paused = play() === false;
		},
		pause: function () {
			if ( paused === false ) paused = stop();
		},
		get currentTime() {
			if ( paused === true ) return currentTime;
			return getCurrentTime();
		},
		set currentTime( value ) {
			if ( paused === false ) stop();
			currentTime = value;
			if ( paused === false ) play();
		},
		get playbackRate() {
			return playbackRate;
		},
		set playbackRate( value ) {
			if ( paused === false ) stop();
			playbackRate = value;
			if ( paused === false ) play();
		},
		set src( url ) {
			load( url );
		},
		get loop() {
			return loop;
		},
		set loop( value ) {
			loop = value;
		},
		get paused() {
			return paused;
		}
	}

}

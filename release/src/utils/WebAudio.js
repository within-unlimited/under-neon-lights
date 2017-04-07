/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebAudio( context ) {

	if ( context === undefined ) {

		context = WebAudio.context;

	}

	var scope = this;
	var source, buffer, binary;

	var currentTime = 0;
	var loop = false;
	var playbackRate = 1;

	var paused = true;
	var startAt = 0;

	var volume;

	if ( context ) {

		createVolume();

	}

	function load( url ) {

		var request = new XMLHttpRequest();
		request.open( 'GET', url, true );
		request.responseType = 'arraybuffer';
		request.addEventListener( 'load', function ( event ) {
			binary = event.target.response;
			if ( context ) {
				decode();
			}
		} );
		request.send();

	}

	function decode() {

		context.decodeAudioData( binary, function ( data ) {
			buffer = data;
			if ( paused === false ) play();
		} );

	}

	function createVolume() {

		if ( !context.volume ) {
			context.volume = context.createGain();
			context.volume.connect( context.destination );
			context.volume.gain.value = 1;
		}

		volume = context.createGain();
		volume.connect( context.volume );
		volume.gain.value = 1;

	}

	function getCurrentTime() {

		if ( buffer === undefined || paused === true ) return currentTime;
		return currentTime + ( context.currentTime - startAt ) * playbackRate;

	}

	function play() {

		if ( context === undefined ) {

			context = WebAudio.getContext();
			createVolume();

			paused = false;
			decode();

		}

		if ( buffer === undefined ) return;

		source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = loop;
		source.playbackRate.value = playbackRate;
		source.start( 0, currentTime );
		source.connect( volume );

		startAt = context.currentTime;

	}

	function stop() {

		if ( buffer === undefined ) return;

		source.stop();
		source.disconnect( volume );

		currentTime = getCurrentTime();

	}

	return {
		play: function () {
			if ( paused ) {
				play(); paused = false;
			}
		},
		pause: function () {
			if ( paused === false ) {
				stop(); paused = true;
			}
		},
		get volume() {
			return volume.gain.value;
		},
		set volume(v) {
			volume.gain.value = v;
		},
		get currentTime() {
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
		},
		get buffer() {
			return buffer;
		}
	}

}

WebAudio.getContext = function() {

	if ( WebAudio.context ) {
		return WebAudio.context;
	}

	WebAudio.context = new ( window.AudioContext || window.webkitAudioContext )();

	return WebAudio.context;

};

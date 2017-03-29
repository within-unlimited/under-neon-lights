/**
 * @author mrdoob / http://mrdoob.com/
 */

var WebAudio = ( function () {

	var context;

	return function () {

		if ( context === undefined ) {

 			context = new ( window.AudioContext || window.webkitAudioContext )();

		}

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
					if ( paused === false ) play();
				} );
			} );
			request.send();

		}

		function getCurrentTime() {

			if ( buffer === undefined || paused === true ) return currentTime;
			return currentTime + ( context.currentTime - startAt ) * playbackRate;

		}

		function play() {

			if ( buffer === undefined ) return;

			source = context.createBufferSource();
			source.buffer = buffer;
			source.loop = loop;
			source.playbackRate.value = playbackRate;
			source.start( 0, currentTime );
			source.connect( context.destination );

			startAt = context.currentTime;

		}

		function stop() {

			if ( buffer === undefined ) return;

			source.stop();
			source.disconnect( context.destination );

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
			}
		}

	};

} )()

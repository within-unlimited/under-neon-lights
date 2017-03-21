/**
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 */

var WEBVR = {

	isLatestAvailable: function () {

		console.warn( 'WEBVR: isLatestAvailable() is being deprecated. Use .isAvailable() instead.' );
		return this.isAvailable();

	},

	isAvailable: function () {

		return navigator.getVRDisplays !== undefined;

	},

	getMessage: function (opts) {

		var opts = opts || {};

		var options = {
			dismiss: 'Got it!'
		};

		if ( navigator.getVRDisplays ) {

			if ( opts.displays.length === 0 ) {
				options.message = 'WebVR supported, but no VRDisplays found.';
			}

		} else {

			options.message = 'Your browser does not support WebVR. See <a href="http://webvr.info">webvr.info</a> for assistance, or continue to explore in magic window mode.';

		}

		if ( options.message !== undefined ) {
			
			if ( opts.silent ) return true;

			var template = '<div class="dialog"><p><%= message %></p><button class="dismiss"><%= dismiss %></button></div>';
			var message = document.createElement('div');
			message.classList.add('message');
			message.innerHTML = _.template(template)(options);

			var dismiss = message.querySelector('button');
			dismiss.onclick = function(e) {
				e.preventDefault();
				var mainContainer = document.querySelector('.container');
				mainContainer.removeChild( message );
			};

			return message;

		}

	},

	getButton: function ( effect ) {

		var icon = '<img src="../release/images/cardboard.svg" alt="VR Headset" /> ';

		var button = document.createElement( 'a' );
		button.classList.add('button', 'abs-bc'); // moved styles into vr-menu.scss
		button.innerHTML = icon + 'Enter VR';
		button.onclick = function(e) {

			e.preventDefault();
			effect.isPresenting ? effect.exitPresent() : effect.requestPresent();

		};

		window.addEventListener( 'vrdisplaypresentchange', function ( event ) {

			button.innerHTML = icon + ( effect.isPresenting ? 'Exit VR' : 'Enter VR' );

		}, false );

		return button;

	}

};

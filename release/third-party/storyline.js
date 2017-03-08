( function() {

var ACTIONS = {
	CUT: 0,
	EASE: 1,
	LINEAR: 2
}

function StorylineEvent() {
	this.start = null;
	this.end = null;
	this.action = null;
	this.from = 0;
	this.to = 0;
	this.duration = 0;
}

function Storyline() {

	this.points = {};

	this.get = function( id, t ) {
		return averageData( this.points, t, id );
	}

}

function parseStoryline( story ) {

	var s = new Storyline();

	for( var v in story ) {
		if( story.hasOwnProperty( v ) ) {

			var storyboard = [];

			story[ v ].forEach( function( e ) {
				var start = e.match( /([^\s]+)/ );
				var event = new StorylineEvent();
				if( e.indexOf( 'cut to' ) != -1 ) {
					event.start = parseFloat( start[ 1 ] );
					event.action = ACTIONS.CUT;
					var v = e.match( /[^\s]+ cut to ([^\s]+)/ );
					event.from = parseFloat( v[ 1 ] );
					event.to = event.from;
					event.end = event.start;
				}
				if( e.indexOf( 'ease to' ) != -1 ) {
					event.end = parseFloat( start[ 1 ] );
					event.action = ACTIONS.EASE;
					event.from = 0;
					var v = e.match( /[^\s]+ ease to ([^\s]+)/ );
					event.to = parseFloat( v[ 1 ] );
				}
				if( e.indexOf( 'linear to' ) != -1 ) {
					event.end = parseFloat( start[ 1 ] );
					event.action = ACTIONS.LINEAR;
					event.from = 0;
					var v = e.match( /[^\s]+ linear to ([^\s]+)/ );
					event.to = parseFloat( v[ 1 ] );
				}
				storyboard.push( event );
			} );

			storyboard.forEach( function( e, i ) {
				if( e.action === ACTIONS.EASE || e.action == ACTIONS.LINEAR ) {
					e.start = storyboard[ i - 1 ].end;
					e.from = storyboard[ i - 1 ].to;
				}
				e.duration = e.end - e.start;
			} );

			storyboard.forEach( function( e, i ) {
				if( e.action === ACTIONS.CUT ) {
					if( storyboard[ i + 1 ] ) {
						e.end = storyboard[ i + 1 ].start;
					}
				}
			} );

			/*storyboard.forEach( function( e, i ) {
				console.log( e.from + '(' + e.start + ')' + ' to ' + e.to + '(' + e.end + ') in ' + e.duration );
			} );*/

			s.points[ v ] = storyboard;

		}
	}

	return s;

}

function getPointInStoryline( storyline, t, value ) {

	if( !storyline[ value ] ) return null;

	for( var j = 0; j < storyline[ value ].length; j++ ) {
		var e = storyline[ value ][ j ];
		if( e.start <= t && e.end > t ) {
			return e;
		}
	}

	return null;

}

function averageData( story, t, value ) {

	if( !story[ value ] ) {
		console.warn( value + ' not found on storyboard' );
		return;
	}

	var p;

	if( t > story[ value ][ story[ value ].length - 1 ].end ) {
		p = story[ value ][ story[ value ].length - 1 ];
	} else {
		p = getPointInStoryline( story, t, value );
	}

	if( !p ) return null;

	if( p.action === ACTIONS.CUT ) {
		return p.from;
	}

	if( p.action === ACTIONS.EASE ) {

		var et = ( t - p.start ) / p.duration;
		et = Math.max( Math.min( et, 1 ), 0 );
		var easing;
		if ( ( et *= 2 ) < 1 ) easing = 0.5 * et * et;
		else easing = - 0.5 * ( --et * ( et - 2 ) - 1 );

		var v = p.from + ( easing * ( p.to - p.from ) );

		return v;

	}

	if( p.action === ACTIONS.LINEAR ) {

		var et = ( t - p.start ) / p.duration;
		et = Math.max( Math.min( et, 1 ), 0 );
		var v = p.from + ( et * ( p.to - p.from ) );

		return v;

	}

}

function setValue( original, value ) {

	if( value !== null ) return value;
	return original

}

window.STORYLINE = {
	parseStoryline: parseStoryline
}

} )();

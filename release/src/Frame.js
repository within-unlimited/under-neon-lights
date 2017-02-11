var FRAME = ( function () {

	return {

		VERSION: 3,

		dom: null,

		Resources: {},

		Curves: {

			/*
			Linear: function ( points ) {

				function linear( p0, p1, t0, t1, t ) {

					return ( p1 - p0 ) * ( ( t - t0 ) / ( t1 - t0 ) ) + p0;

				}

				this.points = points;
				this.value = 0;

				this.update = function ( time ) {

					if ( time <= points[ 0 ] ) {

						this.value = points[ 1 ];

					} else if ( time >= points[ points.length - 2 ] ) {

						this.value = points[ points.length - 1 ];

					} else {

						for ( var i = 0, l = points.length; i < l; i += 2 ) {

							if ( time < points[ i + 2 ] ) {

								this.value = linear( points[ i + 1 ], points[ i + 3 ], points[ i ], points[ i + 2 ], time );
								break;

							}

						}

					}

				};

			},

			Sin: function () {

				var frequency = 10;

				this.value = 0;

				this.update = function ( time ) {

					this.value = Math.sin( time * frequency );

				};

			},

			Saw: function ( frequency, offset, min, max ) {

				var delta = max - min;

				this.frequency = frequency;
				this.offset = offset;
				this.min = min;
				this.max = max;
				this.value = 0;

				this.update = function ( time ) {

					this.value = ( ( ( time - offset ) % frequency ) / frequency ) * delta + min;

				};

			}
			*/

		},

		Parameters: {

			Boolean: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : true;
			},

			Color: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : 0xffffff;
			},

			Float: function ( name, value, min, max ) {
				this.name = name;
				this.value = value || 0.0;
				this.min = min !== undefined ? min : - Infinity;
				this.max = max !== undefined ? max : Infinity;
			},

			Integer: function ( name, value, min, max ) {
				this.name = name;
				this.value = value || 0;
				this.min = min !== undefined ? min : - Infinity;
				this.max = max !== undefined ? max : Infinity;
			},

			String: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : '';
			},

			Vector2: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : [ 0, 0 ];
			},

			Vector3: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : [ 0, 0, 0 ];
			}

		},

		Effect: function ( name, source ) {

			this.name = name;
			this.source = source || 'var parameters = {\n\tvalue: new FRAME.Parameters.Float( \'Value\', 1.0 )\n};\n\n// function init(){}\n\nfunction start(){}\n\nfunction update( progress ){}';
			this.program = null;
			this.compile = function () {

				this.program = ( new Function( 'dom, resources, parameters, init, start, update', this.source + '\nreturn { parameters: parameters, init: init, start: start, update: update };' ) )( FRAME.dom, FRAME.Resources );

			};

		},

		Animation: function () {

			var id = 0;

			return function ( name, start, end, layer, effect ) {

				this.id = id ++;
				this.name = name;
				this.start = start;
				this.end = end;
				this.layer = layer;
				this.effect = effect;

				// compile

				if ( effect.program === null ) {

					effect.compile();

				}

			};

		}(),

		Timeline: function () {

			var curves = [];
			var animations = [];
			var active = [];

			var next = 0, prevtime = 0;

			return {

				curves: curves,
				animations: animations,

				add: function ( animation ) {

					animations.push( animation );
					this.sort();

				},

				remove: function ( animation ) {

					var i = animations.indexOf( animation );

					if ( i !== -1 ) {

						animations.splice( i, 1 );

					}

				},

				sort: function () {

					animations.sort( function ( a, b ) { return a.start - b.start; } );

				},

				update: function ( time ) {

					if ( time < prevtime ) {

						this.reset();

					}

					var animation;

					// add to active

					while ( animations[ next ] ) {

						animation = animations[ next ];

						if ( animation.start > time ) {

							break;

						}

						if ( animation.end > time ) {

							active.push( animation );
							animation.effect.program.start();

						}

						next ++;

					}

					// remove from active

					var i = 0;

					while ( active[ i ] ) {

						animation = active[ i ];

						if ( animation.end < time ) {

							active.splice( i, 1 );
							continue;

						}

						i ++;

					}

					// update curves

					for ( i = 0, l = curves.length; i < l; i ++ ) {

						curves[ i ].update( time );

					}

					// render

					active.sort( function ( a, b ) { return a.layer - b.layer; } );

					for ( i = 0, l = active.length; i < l; i ++ ) {

						animation = active[ i ];
						animation.effect.program.update( ( time - animation.start ) / ( animation.end - animation.start ) );

					}

					prevtime = time;

				},

				reset: function () {

					while ( active.length ) active.pop();
					next = 0;

				}

			};

		}

	};

} )();

/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousSound = root.Sound || {};
  var ctx, analysis, has;
  var identity = function(v) { return v; };

  root.AudioContext = root.AudioContext || root.webkitAudioContext;
  has = !!(root.AudioContext);

  if (has) {

    ctx = new root.AudioContext();
    analysis = ctx.createAnalyser();

    analysis.connect(ctx.destination);
    analysis.fftSize = 128;
    analysis.data = new Uint8Array(analysis.frequencyBinCount);

  }

  /**
   * @class
   */
  var Sound = root.Sound = function(url, callback) {

    var scope = this;
    var assignBuffer = function(buffer) {

      scope.buffer = buffer;

      scope.gain = scope.filter = ctx.createGain();
      scope.gain.connect(analysis);
      scope.gain.gain.value = Math.max(Math.min(scope._volume, 1.0), 0.0);

      if (callback) {
        callback(scope);
      }

    };

    this._ended = function() {
      scope.playing = false;
    };

    switch (typeof url) {

      case 'string':
        this.url = url;
        Sound.load(url, assignBuffer);
        break;

      case 'array':
      case 'object':
        Sound.decode(url, assignBuffer);
        break;

    }

  };

  extend(Sound, {

    has: has,

    ctx: ctx,

    analysis: analysis,

    noConflict: function() {
      root.Sound = previousSound;
      return Sound;
    },

    load: function(uri, callback) {

      var r = new XMLHttpRequest();
      r.open('GET', uri, true);
      r.responseType = 'arraybuffer';

      r.onload = function(buffer) {
        Sound.decode(r.response, callback);
      };

      r.send();

      return r;

    },

    decode: function(data, callback) {

      var success = function(buffer) {
        if (callback) {
          callback(buffer);
        }
      };

      var error = function() {
        console.error('decodeAudioData error:', error);
      };

      ctx.decodeAudioData(data, success, error);

    },

    Utils: {
      extend: extend,
      defaults: defaults
    }

  });

  extend(Sound.prototype, {

    _loop: false,

    _volume: 1.0,

    _speed: 1.0,

    _startTime: 0,

    _offset: 0,

    playing: false,

    filter: null,

    gain: null,

    applyFilter: function(node) {

      if (this.filter && this.filter !== this.gain) {
        this.filter.disconnect(this.gain);
      }

      this.filter = node;
      this.gain.connect(this.filter);

      return this;

    },

    play: function(options) {

      var params = defaults(options || {}, {
        time: ctx.currentTime,
        loop: this._loop,
        offset: this._offset,
        duration: this.buffer.duration - this._offset
      });

      if (this.source) {
        this.stop();
      }

      this._startTime = params.time;
      this._loop = params.loop;
      this.playing = true;

      this.source = ctx.createBufferSource();
      this.source.onended = this._ended;
      this.source.buffer = this.buffer;
      this.source.loop = params.loop;
      this.source.playbackRate.value = this._speed;

      this.source.connect(this.filter);

      if (this.source.start) {
        this.source.start(params.time, params.offset);
      } else if (this.source.noteOn) {
        this.source.noteOn(params.time, params.offset);
      }

      return this;

    },

    pause: function(options) {

      if (!this.source || !this.playing) {
        return this;
      }

      var params = defaults(options || {}, {
        time: ctx.currentTime
      });

      this.source.onended = identity;

      if (this.source.stop) {
        this.source.stop(params.time);
      } else if (this.source.noteOff) {
        this.source.noteOff(params.time);
      }

      this.playing = false;

      var currentTime = ctx.currentTime;
      if (params.time != 'undefined') {
        currentTime = params.time;
      }

      this._offset = currentTime - this._startTime + (this._offset || 0);

      if (this._loop) {
        this._offset = Math.max(this._offset, 0.0) % this.buffer.duration;
      } else {
        this._offset = Math.min(Math.max(this._offset, 0.0), this.buffer.duration);
      }

      return this;

    },

    stop: function(options) {

      if (!this.source || !this.playing) {
        return this;
      }

      var params = defaults(options || {}, {
        time: ctx.currentTime
      });

      this.source.onended = identity;

      if (this.source.stop) {
        this.source.stop(params.time);
      } else if (this.source.noteOff) {
        this.source.noteOff(params.time);
      }

      this.playing = false;
      this._offset = 0;

      return this;

    }

  });

  Object.defineProperty(Sound.prototype, 'loop', {

    enumerable: true,

    get: function() {
      return this._loop;
    },

    set: function(l) {
      this._loop = !!l;
      if (this.playing) {
        this.play();
      }
    }

  });

  Object.defineProperty(Sound.prototype, 'volume', {

    enumerable: true,

    get: function() {
      return this._volume;
    },

    set: function(v) {
      this._volume = v;
      if (this.gain) {
        this.gain.gain.value = Math.max(Math.min(this._volume, 1.0), 0.0);
      }
    }

  });

  Object.defineProperty(Sound.prototype, 'speed', {

    enumerable: true,

    get: function() {
      return this._speed;
    },

    set: function(s) {
      this._speed = s;
      if (this.playing) {
        this.play();
      }
    }

  });

  Object.defineProperty(Sound.prototype, 'currentTime', {

    enumerable: true,

    get: function() {
      return this.playing ? (ctx.currentTime - this._startTime + this._offset) * this._speed : this._offset;
    },

    set: function(t) {

      var time;

      if (!this.buffer) {
        return this;
      }

      if (this._loop) {
        time = Math.max(t, 0.0) % this.buffer.duration;
      } else {
        time = Math.min(Math.max(t, 0.0), this.buffer.duration);
      }

      this._offset = time;

      if (this.playing) {
        this.play();
      }

    }

  });

  Object.defineProperty(Sound.prototype, 'millis', {

    enumerable: true,

    get: function() {
      return Math.floor(this.currentTime * 1000);
    }

  });

  Object.defineProperty(Sound.prototype, 'duration', {

    enumerable: true,

    get: function() {
      if (!this.buffer) {
        return 0;
      }
      return this.buffer.duration;
    }

  });

  function extend(base) {

    if (arguments.length < 2) {
      return base;
    }

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var k in obj) {
        base[k] = obj[k];
      }
    }

    return base;

  }

  function defaults(base) {

    if (arguments.length < 2) {
      return base;
    }

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var k in obj) {
        if (typeof base[k] == 'undefined') {
          base[k] = obj[k];
        }
      }
    }

    return base;

  }

})();

/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var Empty = Sound.Empty = function(data) {

    var scope = this;

    this.duration = data.duration || 0;
    this.url = data.url || '';

    this._tick = function() {

      if (scope.playing) {
        requestAnimationFrame(scope._tick);
      }

      var now = Date.now();
      scope._currentTime += (now - scope._tick.then) / 1000;
      scope._tick.then = now;

      if (scope._currentTime < scope.duration) {
        return;
      }

      scope.currentTime = scope._currentTime;

      if (!scope.loop) {
        scope.playing = false;
      }

    };
    this._tick.then = 0;

  };

  Sound.Utils.extend(Empty.prototype, {

    _currentTime: 0,

    duration: 0,

    playing: false,

    loop: false,

    play: function(options) {

      var params = Sound.Utils.defaults(options || {}, {
        offset: this._currentTime,
        loop: this.loop
      });

      this._currentTime = params.offset;
      this.loop = !!params.loop;

      this.playing = true;
      this._tick.then = Date.now();

      this._tick();

      return this;

    },

    pause: function() {

      this.playing = false;
      return this;

    },

    stop: function() {

      this.playing = false;
      this.currentTime = 0;
      return this;

    }

  });

  Object.defineProperty(Empty.prototype, 'currentTime', {

    enumerable: true,

    get: function() {
      return this._currentTime;
    },

    set: function(v) {

      if (this.loop) {
        this._currentTime = Math.max(v, 0.0) % this.duration;
      } else {
        this._currentTime = Math.min(Math.max(v, 0.0), this.duration);
      }

    }

  });

})();

/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousEqualizer = root.Equalizer || {};
  var Colors = {
    'eee': '#eee',
    'ccc': '#ccc',
    'bbb': '#bbb',
    '888': '#888',
    'black': 'black',
    'green': 'rgb(100, 255, 100)',
    'blue': 'rgb(50, 150, 255)',
    'purple': 'rgb(150, 50, 255)',
    'pink': 'rgb(255, 100, 100)',
    'red': 'rgb(255, 50, 50)',
    'orange': 'orange',
    'gold': 'rgb(255, 150, 50)',
    'white': 'white'
  };
  var styles = {
    font: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      size: 11,
      fill: Colors['888'],
      leading: 20,
      weight: 500
    },
    classic: {
      display: 'block',
      position: 'relative',
      background: 'transparent',
      padding: 20 + 'px'
    },
    recording: {
      position: 'absolute',
      borderRadius: '50%',
      top: 10 + 'px',
      left: '50%',
      width: 8 + 'px',
      height: 8 + 'px',
      marginLeft: - 4 + 'px',
      marginTop: - 4 + 'px',
      cursor: 'pointer',
      background: Colors['ccc'],
      content: ''
    }
  };

  var Equalizer = root.Equalizer = function(width, height) {

    this.analyzer = Sound.analysis;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('equalizer');

    var two = this.two = new Two({
      width: width || 200,
      height: height || 100
    }).appendTo(this.domElement);

    extend(two.renderer.domElement.style, styles.classic);

    var vertices = [];
    this.bands = [];
    for (var i = 0; i < Equalizer.Resolution; i++) {

      var pct = (i + 0.5) / Equalizer.Resolution;
      var x = pct * two.width;

      var band = new Two.Line(x, 0, x, 0);

      band.value = 0;
      band.linewidth = (two.width / Equalizer.Resolution) * 0.85;

      band.stroke = Colors['bbb'];
      band.noFill();
      band.opacity = 0.5;

      band.peak = new Two.Line(x - band.linewidth / 2, 0,
        x + band.linewidth / 2, 0);

      band.peak.value = 0;
      band.peak.updated = false;
      band.peak.stroke = Colors['888'];
      band.peak.noFill();
      band.peak.linewidth = 2;

      band.beat = new Two.Ellipse(x, two.height * 0.125, 2, 2);
      band.beat.noStroke();
      band.beat.fill = Colors.blue;

      band.direction = new Two.Line(x - band.linewidth / 2, 0,
        x + band.linewidth / 2, 0);

      band.direction.value = 0;
      band.direction.stroke = Colors.red;
      band.direction.noFill();
      band.direction.linewidth = 2;

      var anchor = new Two.Anchor(x, 0);
      anchor.sum = 0;
      vertices.push(anchor);

      anchor.outlier = new Two.Ellipse(0, 0, 1, 1);
      anchor.outlier.noStroke();
      anchor.outlier.fill = Colors.purple;

      two.add(band, band.peak, band.beat, band.direction);
      this.bands.push(band);

    }

    this.average = new Two.Path(vertices, false, true);
    this.average.stroke = Colors.gold;
    this.average.opacity = 0.85;
    this.average.cap = 'round';
    this.average.linewidth = 1;
    this.average.noFill();
    this.average.index = 1;

    two.add(this.average);

    var enslave = function(anchor, i) {
      anchor.outlier.translation.unbind();
      anchor.outlier.translation = anchor;
      anchor.bind(Two.Events.change, function() {
        Two.Shape.FlagMatrix.call(anchor.outlier);
      });
    };

    for (var i = 0; i < vertices.length; i++) {
      var anchor = vertices[i];
      enslave(anchor, i);
      two.add(anchor.outlier);
    }


  };

  extend(Equalizer, {

    Resolution: 16,

    drag: 0.005,

    drift: 0.33,

    amplitude: 255,

    threshold: 0.25,

    Utils: {

      clamp: clamp,
      extend: extend,

      formatSeconds: formatSeconds,
      defaultStyles: styles

   },

   Colors: Colors

  });

  extend(Equalizer.prototype, {

    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },

    createTimeline: function(timeline) {

      var container = document.createElement('div');
      container.style.position = 'relative';
      elem.appendChild(container);

      if (!timeline) {
        this.timeline = new Equalizer.Timeline(
          this, this.two.width, this.two.width * 1.5);
      }
      this.timeline.appendTo(container);

      this.two.renderer.domElement.style.paddingBottom = 10 + 'px';

      return this;

    },

    analyze: function(sound, json) {

      this.sound = sound instanceof Sound
        ? sound : new Sound.Empty(json);

      if (!this.timeline) {
        this.createTimeline();
      }

      this.timeline.analyze(this.sound, json);

      return this;

    },

    update: function(silent) {

      var two = this.two;

      this.analyzer.getByteFrequencyData(this.analyzer.data);

      var height = two.height * 0.75;
      var step = this.analyzer.data.length / this.bands.length;

      for (var i = 0, y; i < this.bands.length; i++) {

        var pct = i / this.bands.length;
        var band = this.bands[i];
        var index = Math.floor(step * (i + 0.5));

        var value = band.value;
        var peak = band.peak.value;

        band.value = clamp(this.analyzer.data[index], 0, 255);

        if (band.value > band.peak.value) {
          band.peak.value = band.value;
          band.peak.updated = true;
        } else {
          band.peak.value -= band.peak.value * Equalizer.drag;
          band.peak.updated = false;
        }

        var direction = band.direction.value;
        band.direction.value = (band.peak.value - peak < 0 ? - 1 :
          (band.peak.value - peak === 0 ? 0 : 1));
        var changedDirection = direction !== band.direction.value;

        if (changedDirection && band.direction.value > 0) {
          band.beat.scale = 3;
          band.beat.updated = true;
        } else {
          band.beat.scale += (1 - band.beat.scale) * Equalizer.drift;
          band.beat.updated = false;
        }

        band.direction.stroke = band.direction.value <= 0 ? Colors.pink
          : Colors.green;

        y = two.height - height * (band.value / Equalizer.amplitude);
        band.vertices[0].y = two.height;
        band.vertices[1].y = Math.min(y, two.height - 2);

        y = two.height - height * (band.peak.value / Equalizer.amplitude);
        band.peak.vertices[0].y = band.peak.vertices[1].y = y;

        var anchor = this.average.vertices[i];
        anchor.sum += band.value;
        anchor.value = anchor.sum / this.average.index;
        anchor.y = two.height - height * anchor.value / Equalizer.amplitude;

        if (Math.abs(band.value - anchor.value)
          > Equalizer.amplitude * Equalizer.threshold) {
          anchor.outlier.scale = 2;
          anchor.outlier.updated = true;
        } else {
          anchor.outlier.scale += (1 - anchor.outlier.scale) * Equalizer.drift;
          anchor.outlier.updated = false;
        }

      }

      this.average.index++;

      if (this.timeline) {
        this.timeline.update(silent);
      }

      if (!silent) {
        two.update();
      }

      return this;

    },

    reset: function() {

      for (var i = 0; i < this.average.vertices.length; i++) {
        var anchor = this.average.vertices[i];
        anchor.sum = 0;
        anchor.value = 0;
        anchor.y = this.two.height;
      }

      this.average.index = 1;

      return this;

    }

  });

  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  function extend(base) {

    if (arguments.length < 2) {
      return base;
    }

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var k in obj) {
        base[k] = obj[k];
      }
    }

    return base;

  }

  function formatSeconds(time) {

    var min = Math.floor(time / 60);
    var sec = Math.floor(time % 60);
    var mil = Math.floor((time - Math.floor(time)) * 100);

    return [
      min < 10 ? '0' + min : min,
      sec < 10 ? '0' + sec : sec,
      mil < 10 ? '0' + mil : mil
    ].join(':');

  }

})();

/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var Equalizer = root.Equalizer || {};

  var Timeline = Equalizer.Timeline = function(equalizer, width, height) {

    var scope = this;

    this.equalizer = equalizer;
    this.tracks = [];

    var two = this.two = new Two({
      width: width || 200,
      height: (height || 300)
    });

    Equalizer.Utils.extend(two.renderer.domElement.style, Equalizer.Utils.defaultStyles.classic, {
      padding: 0,
      margin: 20 + 'px',
      marginTop: 0,
      cursor: 'ns-resize',
      userSelect: 'none'
    });

    this.layers = {
      backdrop: two.makeGroup(),
      rulers: two.makeGroup(),
      stage: two.makeGroup(),
      labels: two.makeGroup()
    };

    var i, line, x, y, text, diamond, radius = 3;

    for (i = 0; i < Equalizer.Resolution; i++) {

      var pct = (i + 0.5) / Equalizer.Resolution;

      x = pct * two.width - two.width / 2;
      y = two.height / 2;
      line = new Two.Line(x, - y, x, y);

      line.noFill().stroke = Equalizer.Colors['eee'];
      this.layers.backdrop.add(line);

      this.tracks.push(new Track(this, i));

      diamond = this.tracks[this.tracks.length - 1].diamond
        = new Two.Rectangle(x, 0, radius * 2, radius * 2);
      diamond.rotation = Math.PI / 4;
      diamond.noStroke().fill = Equalizer.Colors['gold'];

      this.layers.labels.add(diamond);

    }

    x = two.width / 2;
    y = Timeline.Padding - two.height / 2;

    this.layers.labels.background = new Two.Rectangle(
      0, (Timeline.Padding - two.height) / 2, two.width, Timeline.Padding);
    this.layers.labels.background.noStroke();
    this.layers.labels.background.fill = Equalizer.Colors.white;
    this.layers.labels.add(this.layers.labels.background);

    this.needle = new Two.Line(- x, y, x, y);
    this.needle.noFill().stroke = Equalizer.Colors['888'];
    this.layers.labels.add(this.needle);

    this.time = new Two.Text(
      Equalizer.Utils.formatSeconds(0),
      - x, y - Equalizer.Utils.defaultStyles.font.leading / 2,
      Equalizer.Utils.defaultStyles.font);
    this.time.alignment = 'left';
    this.layers.labels.add(this.time);

    this.duration = new Two.Text(
      Equalizer.Utils.formatSeconds(0),
      x, y - Equalizer.Utils.defaultStyles.font.leading / 2,
      Equalizer.Utils.defaultStyles.font);
    this.duration.alignment = 'right';
    this.duration.fill = Equalizer.Colors['bbb'];
    this.layers.labels.add(this.duration);

    this.recording = document.createElement('div');
    this.recording.classList.add('recording');

    Object.defineProperty(this.recording, 'enabled', {

      get: function() {
        return this._enabled;
      },

      set: function(v) {

        this._enabled = !!v;

        this.style.background = Equalizer.Colors[
          this._enabled ? 'red' : '888'];
        this.style.top = (this._enabled ? two.height - 10 : 10) + 'px';

        var bottom = two.height / 2;
        var top = Timeline.Padding - two.height / 2;

        scope.needle.translation.y = this._enabled ? bottom: top;
        scope.time.translation.y = scope.needle.translation.y
          - Equalizer.Utils.defaultStyles.font.leading / 2;
        scope.duration.translation.y = scope.time.translation.y;

        for (var i = 0; i < scope.tracks.length; i++) {
          var track = scope.tracks[i];
          var shape = track.diamond;
          shape.translation.y = this._enabled
            ? (top + radius) : (bottom - radius);
        }

      }

    });

    Equalizer.Utils.extend(this.recording.style, Equalizer.Utils.defaultStyles.recording);
    this.recording.enabled = false;

    this.warning = new Two.Text(
      'Warning: Units Occluded',
      0, y + Equalizer.Utils.defaultStyles.font.leading,
      Equalizer.Utils.defaultStyles.font
    );
    this.warning.fill = Equalizer.Colors.red;
    this.warning.visible = false;

    this.layers.labels.add(this.warning);

    for (i = 0; i < Timeline.Resolution; i++) {
      var shape = new Two.Line(0, 0, 0, 0);
      shape.stroke = Equalizer.Colors.blue;
      shape.linewidth = 4;
      shape.cap = 'round';
      shape.visible = false;
      this.layers.stage.add(shape);
    }

    two.scene.translation.set(two.width / 2, two.height / 2);

  };

  Equalizer.Utils.extend(Timeline, {

    Resolution: 128,

    Atomic: 0.33,

    Padding: 20,

    Viscosity: 0.125,  // Seconds

    toggleTrack: function(track) {

      var diamond = track.diamond;
      var timeline = track.timeline;

      return function(e) {

        var gold = Equalizer.Colors['gold'];
        var gray = Equalizer.Colors['ccc'];

        track.active = !track.active;
        diamond.fill = track.active ? gold : gray;

        if (!(e.ctrlKey || e.metaKey)) {
          return;
        }

        for (var i = 0; i < timeline.tracks.length; i++) {
          var t = timeline.tracks[i];
          if (track.index === i) {
            continue;
          }
          t.active = !track.active;
          t.diamond.fill = t.active ? gold : gray;
        }

      };

    },

    addInteraction: function(disableRecording) {

      var scope = this;
      var two = this.two;
      var stage = this.two.renderer.domElement;

      stage.addEventListener('mousewheel', function(e) {

        e.preventDefault();
        e.stopPropagation();

        deselectShape();

        var dy = e.deltaY / two.height;
        scope.range = Math.max(Math.min(scope.range + dy, scope.sound.duration), Timeline.Atomic);

      }, false);

      var mouse = new Two.Vector();

      var mousedown = function(e) {

        var rect = stage.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        mouse.playing = scope.sound.playing;
        mouse.set(x, y);
        scope.sound.pause();

        window.addEventListener('mousemove', mousemove, false);
        window.addEventListener('mouseup', mouseup, false);

      };
      var mousemove = function(e) {

        e.preventDefault();

        deselectShape();

        var rect = stage.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        scope.sound.currentTime -= scope.range * (y - mouse.y) / two.height;
        mouse.set(x, y);

      };
      var mouseup = function(e) {

        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);

        if (mouse.playing) {
          scope.sound.play();
        }

      };

      var keydown = function(e) {

        if (e.ctrlKey || e.altKey
          || e.metaKey || childOf(e.target, Unit.inputField)) {
          return;
        }

        var triggered = false;
        var code = String.fromCharCode(e.which).toLowerCase();

        switch (code) {

          case ' ':
            triggered = true;
            scope.sound[scope.sound.playing ? 'pause' : 'play']();
            break;

          case 'r':
            triggered = true;
            scope.recording.enabled = !scope.recording.enabled;
            break;

          case '\b':
            triggered = true;
            if (e.shiftKey) {
              scope.sound.currentTime = scope.sound.duration;
            } else {
              scope.sound.currentTime = 0;
            }
            break;

          case '\t':
            triggered = true;
            var playing = scope.sound.playing;
            if (playing) {
              scope.sound.pause();
            }
            if (e.shiftKey) {
              scope.sound.currentTime += scope.range;
            } else {
              scope.sound.currentTime -= scope.range;
            }
            if (playing) {
              scope.sound.play();
            }
            break;

        }

        if (triggered) {
          e.preventDefault();
        }

      };

      var selectShape = function(e) {

        if (scope.sound.playing) {
          return;
        }

        var shape = selectShape.clicked = this.shape;
        var unit = shape.unit;
        shape.stroke = Equalizer.Colors.purple;

        var position = shape.getBoundingClientRect();
        var offset = scope.two.renderer.domElement.getBoundingClientRect();
        var scrollTop = document.body.scrollTop;
        var scrollLeft = document.body.scrollLeft;

        Unit.inputField.set(unit);

        Equalizer.Utils.extend(Unit.inputField.style, {
          display: 'block',
          top: (position.height / 2 + position.top + offset.top + scrollTop) + 'px',
          left: (position.left + offset.left + scrollLeft) + 'px'
        });

      };
      selectShape.clicked = null;

      var deselectShape = Unit.inputField.deselectShape = function(e) {

        if (!selectShape.clicked || (e && childOf(e.target, Unit.inputField))) {
          return;
        }
        selectShape.clicked.stroke = Equalizer.Colors.blue;
        Unit.inputField.style.display = 'none';

      };

      window.addEventListener('mouseup', deselectShape, false);

      this.recording.addEventListener('click', function() {
        scope.recording.enabled = !scope.recording.enabled;
      }, false);
      stage.addEventListener('mousedown', mousedown, false);
      window.addEventListener('keydown', keydown, false);

      this.two.update();

      for (var i = 0; i < Timeline.Resolution; i++) {

        if (i < this.tracks.length) {

          var diamond = this.tracks[i].diamond;
          diamond.toggle = Timeline.toggleTrack(this.tracks[i]);
          diamond._renderer.elem.addEventListener('click', diamond.toggle, false);
          diamond._renderer.elem.style.cursor = 'pointer';

          if (!!disableRecording) {
            diamond.visible = false;
          }

        }

        var shape = this.layers.stage.children[i];
        shape._renderer.elem.shape = shape;
        shape._renderer.elem.addEventListener('click', selectShape, false);
        shape._renderer.elem.style.cursor = 'pointer';

      }

    }

  });

  Equalizer.Utils.extend(Timeline.prototype, {

    sound: null,
    range: 3, // in seconds

    appendTo: function(elem, disableRecording) {
      this.two.appendTo(elem);
      if (!disableRecording) {
        elem.appendChild(this.recording);
      }
      Timeline.addInteraction.call(this, disableRecording);
      setTimeout(function() {
        document.body.appendChild(Unit.inputField);
      }, 0);
      return this;
    },

    analyze: function(sound, json) {
      this.sound = sound;
      this.duration.value = Equalizer.Utils.formatSeconds(this.sound.duration);
      if (json) {
        this.fromJSON(json);
      }
      return this;
    },

    update: function(silent) {

      if (!this.sound) {
        return this;
      }

      var currentTime = parseFloat(this.sound.currentTime.toFixed(3));
      var two = this.two;
      var i, id = 0; // index of shape to be drawn.
      var bands;

      if (this.equalizer) {
        bands = this.equalizer.bands;
      }

      this.time.value = Equalizer.Utils.formatSeconds(currentTime);

      for (i = this.tracks.length - 1; i >= 0; i--) {

        var pct = (i + 0.5) / this.tracks.length;
        var band;
        if (this.equalizer) {
          band = bands[i];
        }
        var track = this.tracks[i];

        if (this.equalizer && this.recording.enabled && band.beat.updated) {
          track.add(currentTime);
        }

        track.update(currentTime);

        var uid = track.elements.index;
        var unit = track.elements[uid];

        if (this.recording.enabled) {

          if (!unit) {
            uid = track.elements.length - 1;
            unit = track.elements[uid];
          }

          while (id < Timeline.Resolution && unit
            && (unit.time > (currentTime - this.range)
              || unit.value > (currentTime - this.range))) {

            if (unit.time < currentTime) {
              this.draw(track, unit, id, currentTime, pct);
              id++;
            }

            uid--;
            unit = track.elements[uid];

          }

        } else {

          if (!unit) {
            uid = 0;
            unit = track.elements[uid];
          }

          while (id < Timeline.Resolution && unit
            && (unit.time < (currentTime + this.range))) {

            if (unit.time > currentTime || unit.value > currentTime) {
              this.draw(track, unit, id, currentTime, pct);
              id++;
            }

            uid++;
            unit = track.elements[uid];

          }

        }

      }

      this.warning.visible = id >= Timeline.Resolution;

      for (i = id; i < Timeline.Resolution; i++) {
        var shape = this.layers.stage.children[i];
        shape.visible = false;
      }

      if (!silent) {
        this.two.update();
      }

      return this;

    },

    draw: function(track, unit, id, currentTime, pct) {

      var two = this.two;
      var shape = this.layers.stage.children[id];
      var ypct = (unit.time - currentTime) / this.range;

      shape.visible = true;
      shape.translation.x = two.width * pct - two.width / 2;
      shape.translation.y = two.height * ypct + this.needle.translation.y;
      shape.opacity = track.active ? 1 : 0.33;
      shape.unit = unit;

      switch (unit.type) {
        case Unit.Types.hold:
          shape.vertices[1].y = two.height * (unit.value - unit.time)
            / this.range;
          break;
        default:
          shape.vertices[1].y = 0;
      }

      return this;

    },

    toJSON: function() {

      var resp = {
        url: this.sound.url || '',
        duration: this.sound.duration,
        elements: []
      };

      for (var i = 0; i < this.tracks.length; i++) {
        var json = this.tracks[i].toJSON();
        resp.elements.push(json);
      }

      return resp;

    },

    fromJSON: function(json) {

      var obj = json;

      if (typeof json === 'string') {
        obj = JSON.parse(json);
      }

      if (obj.duration && /00\:00\:00/i.test(this.duration.value)) {
        this.duration.value = Equalizer.Utils.formatSeconds(obj.duration);
      }

      for (var i = 0; i < this.tracks.length; i++) {

        // Maps the objects elements to the tracks
        // so that you can try to accommodate different
        // bandwidth resolutions.
        var pct = i / this.tracks.length;
        var index = Math.floor(obj.elements.length * pct);
        this.tracks[i].fromJSON(obj.elements[index]);

      }

      return this;

    }

  });

  var Track = Timeline.Track = function(timeline, i) {

    this.timeline = timeline;
    this.index = i;
    this.elements = [];
    this.elements.index = 0;

  };

  Equalizer.Utils.extend(Track, {

    SortComparator: function(a, b) {
      return a.time - b.time;
    }

  });

  Equalizer.Utils.extend(Track.prototype, {

    active: true,

    add: function(time) {

      if (!this.active) {
        return this;
      }

      if (this.elements.length <= 0) {
        this.elements.push(new Unit(this, time, true));
        return this;
      }

      var length = this.elements.length;
      var index = Math.min(this.elements.index, length - 1);
      var ref = this.elements[index];
      var i;

      if (Math.abs(time - ref.time) < Timeline.Viscosity
        || (ref.type === Unit.Types.hold
          && Math.abs(time - ref.value) < Timeline.Viscosity)) {

        ref.type = Unit.Types.hold;
        ref.value = time;
        return this;

      }

      var unit = new Unit(this, time, true);

      if (time > ref.time) {
        for (i = index; i < length; i++) {
          ref = this.elements[i];
          if (unit.time < ref.time) {
            this.elements.splice(i, 0, unit);
            this.elements.index = i;
            return this;
          }
        }
        this.elements.push(unit);
        this.elements.index = this.elements.length - 1;
        return this;
      }

      for (i = index; i >= 0; i--) {
        ref = this.elements[i];
        if (unit.time > ref.time) {
          this.elements.splice(i + 1, 0, unit);
          this.elements.index = i + 1;
          return this;
        }
      }
      this.elements.unshift(unit);
      this.elements.index = 0;
      return this;

    },

    remove: function(i) {

      var unit;

      if (typeof i !== 'number') {
        unit = i;
        i = this.elements.indexOf(unit);
      }

      if (i < 0) {
        console.warn('Equalizer.Timeline: unable to remove item at index', i);
        return this;
      }

      unit = this.elements.splice(i, 1)[0];

      return unit;

    },

    isOn: function(time) {

      var elements = this.elements;
      var index = this.elements.index;
      var ref = this.elements[index];
      var unit, a, b;

      if (!ref) {
        return false;
      }

      if (ref.time > time) {

        while (index > 0 && elements[index].time > time
          && elements[index].value > time) {
          index--;
        }

        unit = elements[index];

        if (!unit) {
          return false;
        }

        a = time - unit.time;
        b = time - unit.value;

        return this.type === Unit.Types.beat
          ? (a <= Unit.Limit && a >= - Unit.Limit)
          : (a >= 0 && b <= 0);
      }

      while (index < elements.length && elements[index].time < time
        && elements[index].value < time) {
        index++;
      }

      unit = elements[index];

      if (!unit) {
        return false;
      }

      a = time - unit.time;
      b = time - unit.value;

      return this.type === Unit.Types.beat
        ? (a <= Unit.Limit && a >= - Unit.Limit)
        : (a >= 0 && b <= 0);

    },

    update: function(time) {

      if (this.elements.length <= 0) {
        return this;
      }

      var ref = this.elements[this.elements.index];

      if (!ref) {
        this.elements.index = 0;
        ref = this.elements[0];
      }

      var a, b, da, db;

      if (ref.time > time) {
        while (this.elements.index > 0
          && this.elements[this.elements.index].time > time) {
          this.elements.index--;
        }

        return this;

      }

      while (this.elements.index < this.elements.length
        && this.elements[this.elements.index].time < time) {

        a = this.elements[this.elements.index + 1];
        if (a && a.time - time >= 0) {
          break;
        }

        this.elements.index++;

      }

      return this;

    },

    toJSON: function() {
      var resp = [];
      this.elements = this.elements.sort(Track.SortComparator);
      for (var i = 0; i < this.elements.length; i++) {
        var el = this.elements[i];
        resp.push({
          t: el.time,
          v: el.type === Unit.Types.beat ? !!el.value : el.value
        });
      }
      return resp;
    },

    fromJSON: function(list) {
      this.elements.length = 0;
      this.elements.index = 0;
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        var unit = new Unit(this, el.t, el.v);
        if (typeof el.v === 'number') {
          unit.type = Unit.Types.hold;
        }
        this.elements.push(unit);
      }
      return this;
    }

  });

  var Unit = Timeline.Unit = function(track, time, value) {

    this.track = track;
    this.time = time || 0;
    this.value = value || true;

  };

  Equalizer.Utils.extend(Unit, {

    Types: {
      beat: 'beat',
      hold: 'hold'
    },

    inputField: document.createElement('div'),

    Utils: {
      defaultStyles: {
        font: {
          fontSize: 10 + 'px',
          lineHeight: 14 + 'px'
        }
      }
    },

    Limit: 0.005

  });

  Equalizer.Utils.extend(Unit.prototype, {

    type: Unit.Types.beat

  });

  setup();

  function setup() {

    Unit.inputField.classList.add('timeline-unit-input-field');
    Unit.inputField.elems = {
      type: createField('type', Unit.Types),
      time: createField('time', 0),
      value: createField('value', true),
      remove: createField('remove', function() {
        if (!Unit.inputField.unit || !Unit.inputField.unit.track) {
          return;
        }
        Unit.inputField.unit.track.remove(Unit.inputField.unit);
        if (Unit.inputField.deselectShape) {
          Unit.inputField.deselectShape();
        }
      })
    };

    var list = [];

    for (var prop in Unit.inputField.elems) {
      var elem = Unit.inputField.elems[prop];
      Unit.inputField.appendChild(elem);
      list.push(elem);
    }

    Unit.inputField.elems.list = list;

    Equalizer.Utils.extend(Unit.inputField.style,
      Equalizer.Utils.defaultStyles.font, Unit.Utils.defaultStyles.font, {
      display: 'none',
      position: 'absolute',
      width: 120 + 'px',
      height: (18 * Unit.inputField.elems.list.length) + 'px',
      padding: 10 + 'px',
      border: '1px solid ' + Equalizer.Colors['ccc'],
      marginTop: - (2 + 20 + 18 * Unit.inputField.elems.list.length) / 2 + 'px',
      marginLeft: (1 + 10) + 'px',
      background: Equalizer.Colors['white']
    });

    Equalizer.Utils.extend(Unit.prototype, {

      type: Unit.Types.beat,
      time: 0,
      value: false

    });

    Unit.inputField.set = function(unit) {
      Unit.inputField.unit = unit;
      for (var i = 0; i < Unit.inputField.elems.type.input.children.length; i++) {
        var option = Unit.inputField.elems.type.input.children[i];
        option.selected = option.value === unit.type;
      }
      Unit.inputField.elems.time.input.value = unit.time;
      Unit.inputField.elems.value.input.value = unit.value;
    };

  }

  function createField(title, value) {

    var container = document.createElement('div');
    container.classList.add(title);

    var label = document.createElement('label');
    label.for = 'unit-' + title;
    label.innerHTML = title;

    var input;

    if (typeof value === 'function') {

      input = document.createElement('button');
      input.innerHTML = title;
      input.addEventListener('click', value, false);
      input.style.cursor = 'pointer';
      label.innerHTML = '';

    } else if (typeof value === 'object') {

      input = document.createElement('select');

      for (var k in value) {

        var option = document.createElement('option');
        option.value = value[k];
        option.innerHTML = option.value;

        if (option.value === Unit.Types.beat) {
          option.selected = true;
        }

        input.appendChild(option);

      }

    } else {

      input = document.createElement('input');

    }

    input.addEventListener('change', function(e) {
      Unit.inputField.unit[title] = this.value;
    }, false);

    input.id = label.for;
    Equalizer.Utils.extend(label.style, {
      display: 'inline-block',
      width: 25 + '%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      textTransform: 'capitalize'
    });
    Equalizer.Utils.extend(input.style, Unit.Utils.defaultStyles.font, {
      display: 'inline-block',
      height: 12 + 'px',
      width: 66 + '%',
      overflow: 'hidden',
      textTransform: 'capitalize'
    });

    container.appendChild(label);
    container.appendChild(input);

    container.label = label;
    container.input = input;

    return container;

  }

  function childOf(a, b) {

    while (a) {
      if (a === b) {
        return true;
      }
      a = a.parentElement;
    }

    return false;

  }

})();

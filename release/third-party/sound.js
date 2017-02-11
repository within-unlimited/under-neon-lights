/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousSound = root.Sound || {};
  var ctx, analysis, has;

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

    this.url = url;

    this._ended = function() {
      scope.playing = false;
    };

    Sound.load(url, function(buffer) {

      scope.buffer = buffer;

      scope.gain = scope.filter = ctx.createGain();
      scope.gain.connect(analysis);
      scope.gain.gain.value = Math.max(Math.min(scope._volume, 1.0), 0.0);

      if (callback) {
        callback(scope);
      }

    });

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

        var success = function(buffer) {
          if (callback) {
            callback(buffer);
          }
        };

        var error = function() {
          console.error('decodeAudioData error:', error);
        };

        ctx.decodeAudioData(r.response, success, error);

      };

      r.send();

      return r;

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

      Sound.prototype.stop.apply(this, arguments);

      if (this.source && this.playing) {

        var currentTime = ctx.currentTime;
        if (options.time != 'undefined') {
          currentTime = options.time;
        }

        this._offset = currentTime - this._startTime;

        if (this._loop) {
          this._offset = Math.max(this._offset, 0.0) % this.buffer.duration;
        } else {
          this._offset = Math.min(Math.max(this._offset, 0.0), this.buffer.duration);
        }

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

    get: function() {
      return (ctx.currentTime - this._startTime) * this._speed;
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

    get: function() {
      return Math.floor(this.currentTime * 1000);
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

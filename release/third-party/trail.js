/**
 * @author jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var max = Math.max, min = Math.min;

  var delta = new Two.Vector();
  var projection = new Two.Vector();

  var Trail = Two.Trail = function(points) {

    this.destinations = Two.Utils.map(points, function(v) {
      return new Two.Vector().copy(v);
    }, this);

    var length = this.destinations.length;

    var vertices = Two.Utils.map(Two.Utils.range(length * 2), function(i) {
      var k = i;
      if (i >= this.destinations.length) {
        k = this.destinations.length - (i % this.destinations.length) - 1;
      }
      var dest = this.destinations[k];
      return new Two.Anchor().copy(dest);
    }, this);

    Two.Path.call(this, vertices);

    this.forwards = Two.Utils.map(Two.Utils.range(0, length), function(i) {
      return this.vertices[i];
    }, this);

    this.backwards = Two.Utils.map(Two.Utils.range(length, length * 2).reverse(), function(i) {
      return this.vertices[i];
    }, this);

  };

  Two.Utils.extend(Trail, {

  });

  Two.Utils.extend(Trail.prototype, Two.Path.prototype, {

    distance: 3,

    reset: function(x, y) {

      for (var i = this.destinations.length - 1; i >= 0; i--) {

        var v = this.destinations[i];
        var f = this.forwards[i];
        var b = this.backwards[i];

        v.set(x || 0, y || 0);
        f.set(x || 0, y || 0);
        b.set(x || 0, y || 0);

      }

      return this;

    },

    update: function() {

      var length = this.destinations.length, last = length - 1;

      for (var i = 0; i < length; i++) {

        var dest = this.destinations[i];
        var prev = this.destinations[i - 1], a, b, f, pct;

        b = this.backwards[i];
        f = this.forwards[i];

        if (prev) {

          a = Math.atan2(prev.y - dest.y, prev.x - dest.x) + Math.PI / 2;

          var pct = 1 - (i / last);

          projection.x = pct * this.distance * Math.cos(a);
          projection.y = pct * this.distance * Math.sin(a);

          f.copy(dest).addSelf(projection);
          b.copy(dest).subSelf(projection);

        } else {

          prev = this.destinations[i + 1];

          a = Math.atan2(dest.y - prev.y, dest.x - prev.x) + Math.PI / 2;

          var pct = 0.5;

          projection.x = pct * this.distance * Math.cos(a);
          projection.y = pct * this.distance * Math.sin(a);

          f.copy(dest).addSelf(projection);
          b.copy(dest).subSelf(projection);

        }

      }

      return this;

    }

  });

  Two.Path.MakeObservable(Trail.prototype);

})();

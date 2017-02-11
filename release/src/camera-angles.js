(function() {

  var root = this;
  var previousCameraAngles = root.CameraAngles || {};

  var CameraAngles = root.CameraAngles = function() {

    Array.call(this);

    for (var i = 0; i < arguments.length; i++) {
      this.add(arguments[i]);
      arguments[i].fov = CameraAngles.fov;
    }

  };

  CameraAngles.prototype = Object.create(Array.prototype);
  CameraAngles.prototype.constructor = CameraAngles;

  CameraAngles.fov = 60;

  CameraAngles.prototype.index = 0;
  CameraAngles.prototype.aspect = 1;

  CameraAngles.prototype.add = function(el) {

    this.index = this.length;
    this.push(el);
    el.fov = CameraAngles.fov;
    return this;

  };

  CameraAngles.prototype.next = function() {

    var index = this.index;
    this.index = (index + 1) % this.length;
    return this[index];

  };

  Object.defineProperty(CameraAngles.prototype, 'current', {

    get: function() {
      return this[this.index];
    }

  });

  Object.defineProperty(CameraAngles.prototype, 'aspect', {

    get: function() {
      return this._aspect;
    },

    set: function(aspect) {

      this._aspect = aspect;

      for (var i = 0; i < this.length; i++) {
        var camera = this[i];
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      }

    }

  });

})();

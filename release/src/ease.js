(function () {

  var root = this;
  var previousEase = root.Ease || {};

  var Ease = root.Ease = function(value, drag) {

    this.original = value || 0;

    this.value = this.original;
    this.destination = this.original;

    if ((typeof drag).toLowerCase() === 'number') {
      this.drag = drag;
    }

  };

  Ease.prototype = {

    drag: 0.33,

    update: function() {
      this.value += (this.destination - this.value) * this.drag;
      return this;
    },

    clear: function() {
      this.destination = this.value = this.original;
      return this;
    }

  };

})();
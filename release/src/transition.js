(function() {

  var root = this;
  var previousTransition = root.Transition;

  var Transition = root.Transition = function(val, dest) {

    this.value = val;
    this.destination = dest || val;

  };

  Transition.prototype.drag = 0.125;

  Transition.prototype.update = function() {
    this.value += (this.destination - this.value) * this.drag;
    return this;
  };

})();

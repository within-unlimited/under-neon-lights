(function() {

  var root = this;
  var previousElements = root.Elements || {};

  var Elements = root.Elements = function(obj) {

    Object.call(this);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.content.isContainer = true;

    for (var k in obj) {
      this[k] = obj[k];
      this[k].classList.add(k);
    }

  };

  Elements.prototype = Object.create(Object.prototype);
  Elements.prototype.constructor = Elements;

  Elements.Threshold = 12;  // in Pixels

  Elements.onTap = function(elem, func, bubbles) {

    var threshold = Elements.Threshold;
    var mouse = { x: 0, y: 0, dragged: false };

    var touchstart = function(e) {

      var touch = e.changedTouches[0];

      mouse.x = touch.pageX;
      mouse.y = touch.pageY;

      elem.addEventListener('touchmove', touchmove, !!bubbles);
      elem.addEventListener('touchend', touchend, !!bubbles);
      elem.addEventListener('touchcancel', touchend, !!bubbles);

      mouse.dragged = false;

    };
    var touchmove = function() {

      mouse.dragged = true;

    };
    var touchend = function(e) {

      var touch = e.changedTouches[0];

      var dx = Math.abs(touch.pageX - mouse.x);
      var dy = Math.abs(touch.pageY - mouse.y);

      if (dx < threshold && dy < threshold) {
        func(e);
      }

      mouse.dragged = false;

      elem.removeEventListener('touchmove', touchmove, !!bubbles);
      elem.removeEventListener('touchend', touchend, !!bubbles);
      elem.removeEventListener('touchcancel', touchend, !!bubbles);

    };

    if (has.mobile) {
      elem.addEventListener('touchstart', touchstart, !!bubbles);
    } else {
      elem.addEventListener('click', func, !!bubbles);
    }

    return Elements;

  };

  Elements.prototype.forEach = function(func, context) {
    var ctx = context || this;
    for (var k in this) {
      if (!!(this[k] && this[k].nodeType === 1)) {
        func.call(ctx, this[k], k);
      }
    }
    return this;
  };

  Elements.prototype.appendTo = function(elem) {
    elem.appendChild(this.content);
    return this;
  };

  Elements.prototype.append = function(elem) {
    this.content.appendChild(elem);
    return this;
  };

})();

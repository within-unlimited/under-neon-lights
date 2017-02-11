/**
 * @author jonobr1 / http://jonobr1.com
 *
 */

var has = (function() {

  var root = this;
  var previousHas = root.has || {};

  // Let's do a bunch of navigator detections shall we?

  var ua = root.navigator.userAgent;
  var callbacks = [];
  var ready = function() {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
    callbacks.length = 0;
    has._ready = true;
  };

  var has = {

    _ready: false,
    ready: function(func) {
      if (has._ready) {
        func();
        return has;
      }
      callbacks.push(func);
      return has;
    },

    // Mobile Detection

    Android: !!ua.match(/Android/ig),
    Blackberry: !!ua.match(/BlackBerry/ig),
    iOS: !!ua.match(/iPhone|iPad|iPod/ig),
    iPhone: !!ua.match(/iPhone/ig),
    iPad: !!ua.match(/iPad/ig),
    iPod: !!ua.match(/iPod/ig),
    OperaMini: !!ua.match(/Opera Mini/ig),
    Windows: !!ua.match(/IEMobile/ig),
    WebOS: !!ua.match(/webOS/ig),

    // Browser Detection

    Arora: !!ua.match(/Arora/ig),
    Chrome: !!ua.match(/Chrome/ig) && !ua.match(/Edge\//ig),
    Chromium: !!ua.match(/Chrome/ig) && !(document.createElement('video').canPlayType('video/mp4')),
    Epiphany: !!ua.match(/Epiphany/ig),
    Firefox: !!ua.match(/Firefox/ig),
    InternetExplorer: !!ua.match(/(MSIE|Trident)/ig),
    Edge: !!ua.match(/Edge\//ig),
    Midori: !!ua.match(/Midori/ig),
    Opera: !!ua.match(/Opera/ig),
    Safari: !!ua.match(/Safari/ig) && !ua.match(/Chrome/ig),

    webgl: (function() { try { return !!window.WebGLRenderingContext && !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl')); } catch(e) { return false; } })(),

    defineProperty: !!Object.defineProperty,

    webAudio: !!(window.AudioContext || window.webkitAudioContext),

    webvr: !!(window.navigator.getVRDisplays && window.navigator.getVRDisplays().then(function(displays) {
      console.log(displays);
      if (displays.length <= 0) {
        has.webvr = false;
      }
      ready();
    })),

    noConflict: function() {
      root.has = previousHas;
      return has;
    },

  };

  has.mobile = has.Android || has.Blackberry || has.iOS || has.OperaMini || has.Windows || has.WebOS;

  has.localStorage = !!(window.localStorage && window.localStorage.setItem);

  if (!has.webvr) {
    ready();
  }

  root.has = has;

  return has;

})();

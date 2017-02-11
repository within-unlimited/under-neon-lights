(function() {

  var root = this;
  var previousXhr = root.xhr || {};

  var xhr = root.xhr = {

    noConflict: function() {
      root.xhr = previousXhr;
      return xhr;
    },

    get: function(url, callback) {

      var r = new XMLHttpRequest();
      r.open('GET', url);

      r.onreadystatechange = function() {
        if (r.readyState === 4 && r.status === 200) {
          callback(r.responseText);
        }
      };

      r.send();

      return r;

    }

  };

})();

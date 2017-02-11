(function() {

  var root = this;
  var TWO_PI = Math.PI * 2;
  var euler = new THREE.Euler(0, 0, 0, 'YXZ');

  var Annie = root.Annie = function() {

    var geometry = Annie.Geometry;
    var material = Annie.Material;

    THREE.Group.call(this);

    var cone = this.cone = new THREE.Mesh(geometry, material);
    cone.rotation.x = Math.PI / 2;
    cone.rotation.z = Math.PI;
    cone.position.y += 20;

    cone.outline = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      transparent: true,
      color: 'white',
      depthTest: false,
      depthWrite: false,
      opacity: 0.33
    }));

    cone.add(cone.outline);
    cone.scale.set(5, 5, 5);
    this.add(cone);

    this.ghost = new THREE.Object3D();
    this.ghost.rotation.previous = new THREE.Euler();

    this.heading = new THREE.Vector2();
    this.controls = new THREE[has.webvr ? 'VRControls' : (has.mobile ? 'DeviceOrientationControls' : 'MouseControls')](this.ghost);

    this.ghost.theta = 0;
    this.rotation.order = this.ghost.rotation.order = 'YXZ';

  };

  Annie.prototype = Object.create(THREE.Group.prototype);
  Annie.prototype.constructor = Annie;

  Annie.Drag = 0.125;
  Annie.IdealStep = 0.03;

  Annie.Geometry = new THREE.CylinderGeometry(0, 1 * 2, 3 * 2, 16);
  Annie.Material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  Annie.prototype.headingNeedsUpdate = true;
  Annie.prototype._step = 0.02;
  Annie.prototype.step = Annie.prototype._step;

  Annie.prototype.connect = function() {

    this.controls.connect();

    return this;

  };

  Annie.prototype.setCamera = function(camera) {

    this.add(camera);
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';

    return this;

  };

  Annie.prototype.update = function() {

    this.controls.update();

    var theta = mod(this.ghost.rotation.y, TWO_PI);

    this._step += (this.step - this._step) * Annie.Drag;

    this.rotation.y = theta;

    this.heading.set(
      - this._step * Math.sin(theta),
      this._step * Math.cos(theta)
    );

    if (!this.camera || !this.controls.enabled) {
      return;
    }

    this.camera.rotation.x = this.ghost.rotation.x;
    this.camera.rotation.z = this.ghost.rotation.z;

    return this;

  };

  function mod(v, l) {
    while (v < l) {
      v += l;
    }
    return v % l;
  }

})();

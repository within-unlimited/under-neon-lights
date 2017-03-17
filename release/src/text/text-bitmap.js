
var TextBitmap = function( config, renderer ) {

  this.config = config;
  config.color = config.color || '#fff';
  config.outlineColor = config.outlineColor || '#000';
  config.outlineDistance = config.outlineDistance || 0.3;
  config.threshold = config.threshold || 0.5;

  var geometry = this.geometry = createGeometry( config );

  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load('../release/src/text/roboto-bold.png', function(){
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.getMaxAnisotropy();
  });

  var material = this.material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone( SDFShader.uniforms ),
    fragmentShader: SDFShader.fragmentShader,
    vertexShader: SDFShader.vertexShader,
    side: THREE.DoubleSide,
    transparent: true,
    // depthTest: false
  });

  material.uniforms.map.value = texture;
  material.uniforms.color.value = new THREE.Color( config.color );
  material.uniforms.outlineColor.value = new THREE.Color( config.outlineColor );
  material.uniforms.outlineDistance.value = config.outlineDistance;
  material.uniforms.threshold.value = config.threshold;

  var mesh = this.mesh = new THREE.Mesh( geometry, material );
  var group = this.group = new THREE.Group();
  // var axis = new THREE.AxisHelper( 100 );

  mesh.renderOrder = 1;

  mesh.rotation.x = Math.PI;

  var boxGeo = new THREE.BoxGeometry(1,1,1);
  var boxMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1, wireframe: true });
  var hitBox = this.hitBox = new THREE.Mesh( boxGeo, boxMat );
  hitBox.visible = false;

  this.update();

  group.add( mesh );
  group.add( hitBox );
  // group.add( axis );

}

TextBitmap.prototype.update = function(){

  var geometry = this.geometry;
  var mesh = this.mesh;

  geometry.update( this.config );

  // centering
  geometry.computeBoundingBox();
  mesh.position.x = - geometry.layout.width / 2;
  // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ) / 2; // valign center
  this.hitBox.scale.set( geometry.layout.width, geometry.layout.height, 1 );
  mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
  this.hitBox.position.y = - geometry.layout.height / 2; // valign top

  this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
}

Object.defineProperty(TextBitmap.prototype, 'text', {

  get: function() {
    return this.config.text;
  },

  set: function(s) {

    this.config.text = s;
    this.update();

    return this;

  }

});
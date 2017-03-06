// https://github.com/nopjia/webgl-particles2
var NeonUtils = {};

NeonUtils.createWorldPosMaterial = function() {
  return new THREE.ShaderMaterial( {
    vertexShader: NeonUtils.loadTextFileInject("/release/src/shaders/worldPosition.vert.glsl"),
    fragmentShader: NeonUtils.loadTextFileInject("/release/src/shaders/worldPosition.frag.glsl"),
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });
};

NeonUtils.createParticleMaterial = function() {
  let material = new THREE.ShaderMaterial({
    defines: {
        "POINT_SIZE": "1.0",
    },
    uniforms: {
        "tCurrPos": { type: "t", value: null },
        "tCurrCol": { type: "t", value: null }
    },
    vertexShader: NeonUtils.loadTextFileInject("/release/src/shaders/particle.vert.glsl"),
    fragmentShader: NeonUtils.loadTextFileInject("/release/src/shaders/particle.frag.glsl")
  });
  // material.transparent = true;
  // material.blending = THREE.AdditiveBlending;
  return material;
}

NeonUtils.createSimulationMaterial = function(size, tail_size) {
  return new THREE.ShaderMaterial({
    defines: {
        "SIZE": size + ".0",
        "TAIL_SIZE": tail_size + ".0"
    },
    uniforms: {
        "tInit": { type: "t", value: null },
        "tPrevPos": { type: "t", value: null },
        "tPrevCol": { type: "t", value: null },
        "fPass": { type: "f", value: 0 },
        "fTarget": { type: "f", value: 0 },
        "fTime": { type: "f", value: 0 },
        "fTimeDelta": { type: "f", value: 0 },
        "mProjectionMatrix": { type: "m", value: null },
        "mModelViewMatrix": { type: "m", value: null }
    },
    vertexShader: NeonUtils.loadTextFileInject("/release/src/shaders/simulation.vert.glsl"),
    fragmentShader: NeonUtils.loadTextFileInject("/release/src/shaders/simulation.frag.glsl")
  });
}

NeonUtils.loadTextFile = function(url) {
    var result;
    var req = new XMLHttpRequest();
    req.onerror = function() {
        console.log("Error: request error on " + url);
    };
    req.onload = function() {
        result = this.responseText;
    };
    req.open("GET", url, false);
    req.send();
    return result;
};

NeonUtils.loadTextFileInject = function(url) {
    var regex = /#inject .+/g;
    var fileStr = NeonUtils.loadTextFile(url);
    var matches = fileStr.match(regex);
    if (!matches) return fileStr;
    for (let i = 0; i < matches.length; i++) {
        var injectLine = matches[i];
        var injectUrl = injectLine.split(" ")[1];
        var injectFileStr = NeonUtils.loadTextFileInject(injectUrl);
        fileStr = fileStr.replace(injectLine, injectFileStr);
    }

    return fileStr;
};

NeonUtils.createParticleGeometry = function(size, tail_size) {
    let ATTR_WIDTH = 3;
    let indices = [];
    let i = 0;
    let geo = new THREE.BufferGeometry();
    let pos = new Float32Array(size * size * tail_size * ATTR_WIDTH);
    var idx = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < tail_size; z++) {
          pos[idx + 1] = (x + 0.5) / size; // +0.5 to be at center of texel
          pos[idx + 0] = ((y + 0.5) / size) + ((z - tail_size / 2 + 0.5) / tail_size / size);// / tail_size;
          pos[idx + 2] = 0;//z / tail_size;
          if (z < tail_size - 1) {
            indices.push(i);
            indices.push(i + 1);
          }
          i++;
          idx += ATTR_WIDTH;
        }
      }
    }

    geo.addAttribute( 'position', new THREE.BufferAttribute( pos, ATTR_WIDTH ) );
    geo.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );
    geo.computeBoundingBox();
    return geo;
};

NeonUtils.createRenderTarget = function(size, tail_size) {
  let target = new THREE.WebGLRenderTarget( size, size * tail_size, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat, type: THREE.FloatType
  });
  target.texture.generateMipmaps = false;
  return target;
}

NeonUtils.createParticle = function(size, tail_size) {
  // TODO: test extenesion availablility.
  let targetInit = NeonUtils.createRenderTarget(size, 1);
  let targetPos0 = NeonUtils.createRenderTarget(size, tail_size);
  let targetPos1 = NeonUtils.createRenderTarget(size, tail_size);
  let targetCol0 = NeonUtils.createRenderTarget(size, 1);
  let targetCol1 = NeonUtils.createRenderTarget(size, 1);

  // let particles = new THREE.Points(
  let particles = new THREE.LineSegments(
    NeonUtils.createParticleGeometry(size, tail_size),
    NeonUtils.createParticleMaterial()
  );

  particles.clock = new THREE.Clock();

  particles.targetInit = targetInit;
  particles.targetPos0 = targetPos0;
  particles.targetPos1 = targetPos1;
  particles.targetCol0 = targetCol0;
  particles.targetCol1 = targetCol1;
  particles.frustumCulled = false;

  let simulationPass = new ShaderPass();

  let simulationShader = NeonUtils.createSimulationMaterial(size, tail_size);
  simulationShader.uniforms.tInit.value = targetInit.texture;

  let oddpass = false;
  let pass = 0;

  particles.simulate = function (renderer) {
    oddpass = !oddpass;
    var currentPos = oddpass ? particles.targetPos1 : particles.targetPos0;
    var previousPos = oddpass ? particles.targetPos0 : particles.targetPos1;
    var currentCol = oddpass ? particles.targetCol1 : particles.targetCol0;
    var previousCol = oddpass ? particles.targetCol0 : particles.targetCol1;
    simulationShader.uniforms.tPrevPos.value = previousPos.texture;
    simulationShader.uniforms.tPrevCol.value = previousCol.texture;
    simulationShader.uniforms.fPass.value = pass;
    simulationShader.uniforms.mProjectionMatrix.value = camera.projectionMatrix;
    simulationShader.uniforms.mModelViewMatrix.value = camera.matrixWorldInverse;
    pass++;
    simulationShader.uniforms.fTimeDelta.value = Math.min(1/60, clock.getDelta());
    // console.log(clock.getDelta());
    simulationShader.uniforms.fTime.value = clock.getElapsedTime();
    simulationShader.uniforms.fTarget.value = 0.0;
    simulationPass.render(renderer, simulationShader, currentPos);
    simulationShader.uniforms.fTarget.value = 1.0;
    simulationPass.render(renderer, simulationShader, currentCol);
    particles.material.uniforms.tCurrPos.value = currentPos.texture;
    particles.material.uniforms.tCurrCol.value = currentCol.texture;

  };
  return particles;
}


// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var HEAD_ELBOW_OFFSET = new THREE.Vector3(0.155, -0.465, -0.15);
var ELBOW_WRIST_OFFSET = new THREE.Vector3(0, 0, -0.25);
var WRIST_CONTROLLER_OFFSET = new THREE.Vector3(0, 0, 0.05);
var ARM_EXTENSION_OFFSET = new THREE.Vector3(-0.08, 0.14, 0.08);

var ELBOW_BEND_RATIO = 0.4; // 40% elbow, 60% wrist.
var EXTENSION_RATIO_WEIGHT = 0.4;

var MIN_ANGULAR_SPEED = 0.61; // 35 degrees per second (in radians).

// Represents the arm model for the Daydream controller. Feed it a camera and
// the controller. Update it on a RAF.
// Get the model's pose using getPose().

var OrientationArmModel = this.OrientationArmModel = function () {
  this.isLeftHanded = false;

  // Current and previous controller orientations.
  this.controllerQ = new THREE.Quaternion();
  this.lastControllerQ = new THREE.Quaternion();

  // Current and previous head orientations.
  this.headQ = new THREE.Quaternion();

  // Current head position.
  this.headPos = new THREE.Vector3();

  // Positions of other joints (mostly for debugging).
  this.elbowPos = new THREE.Vector3();
  this.wristPos = new THREE.Vector3();

  // Current and previous times the model was updated.
  this.time = null;
  this.lastTime = null;

  // Root rotation.
  this.rootQ = new THREE.Quaternion();

  // Current pose that this arm model calculates.
  this.pose = {
    orientation: new THREE.Quaternion(),
    position: new THREE.Vector3()
  };
};

// Methods to set controller and head pose (in world coordinates).
OrientationArmModel.prototype.setControllerOrientation = function( quaternion ) {
  this.lastControllerQ.copy(this.controllerQ);
  this.controllerQ.copy(quaternion);
};

OrientationArmModel.prototype.setHeadOrientation = function( quaternion ) {
  this.headQ.copy(quaternion);
};

OrientationArmModel.prototype.setHeadPosition = function ( position ) {
  this.headPos.copy(position);
};

OrientationArmModel.prototype.setLeftHanded = function( isLeftHanded ) {
  // TODO(smus): Implement me!
  this.isLeftHanded = isLeftHanded;
};

// Called on a RAF.
OrientationArmModel.prototype.update = function() {
  this.time = performance.now();

  // If the controller's angular velocity is above a certain amount, we can
  // assume torso rotation and move the elbow joint relative to the
  // camera orientation.
  var headYawQ = this.getHeadYawOrientation();
  var timeDelta = (this.time - this.lastTime) / 1000;
  var angleDelta = this.quatAngle(this.lastControllerQ, this.controllerQ);
  var controllerAngularSpeed = angleDelta / timeDelta;
  if (controllerAngularSpeed > MIN_ANGULAR_SPEED) {
    // Attenuate the Root rotation slightly.
    this.rootQ.slerp(headYawQ, angleDelta / 10);
  } else {
    this.rootQ.copy(headYawQ);
  }

  // We want to move the elbow up and to the center as the user points the
  // controller upwards, so that they can easily see the controller and its
  // tool tips.
  var controllerEuler = new THREE.Euler().setFromQuaternion(this.controllerQ, 'YXZ');
  var controllerXDeg = THREE.Math.radToDeg(controllerEuler.x);
  // var extensionRatio = this.clamp((controllerXDeg - 11) / (50 - 11), 0, 1);
  var extensionRatio = THREE.Math.clamp((controllerXDeg - 11) / (50 - 11), 0, 1);

  // Controller orientation in camera space.
  var controllerCameraQ = this.rootQ.clone().inverse();
  controllerCameraQ.multiply(this.controllerQ);

  // Calculate elbow position.
  var elbowPos = this.elbowPos;
  elbowPos.copy(this.headPos).add(HEAD_ELBOW_OFFSET);
  var elbowOffset = new THREE.Vector3().copy(ARM_EXTENSION_OFFSET);
  elbowOffset.multiplyScalar(extensionRatio);
  elbowPos.add(elbowOffset);

  // Calculate joint angles. Generally 40% of rotation applied to elbow, 60%
  // to wrist, but if controller is raised higher, more rotation comes from
  // the wrist.
  var totalAngle = this.quatAngle(controllerCameraQ, new THREE.Quaternion());
  var totalAngleDeg = THREE.Math.radToDeg(totalAngle);
  var lerpSuppression = 1 - Math.pow(totalAngleDeg / 180, 4); // TODO(smus): ???

  var elbowRatio = ELBOW_BEND_RATIO;
  var wristRatio = 1 - ELBOW_BEND_RATIO;
  var lerpValue = lerpSuppression * (elbowRatio + wristRatio * extensionRatio * EXTENSION_RATIO_WEIGHT);

  var wristQ = new THREE.Quaternion().slerp(controllerCameraQ, lerpValue);
  var invWristQ = wristQ.inverse();
  var elbowQ = controllerCameraQ.clone().multiply(invWristQ);

  // Calculate our final controller position based on all our joint rotations
  // and lengths.
  /*
  position_ =
    root_rot_ * (
      controller_root_offset_ +
  2:      (arm_extension_ * amt_extension) +
  1:      elbow_rot * (kControllerForearm + (wrist_rot * kControllerPosition))
    );
  */
  var wristPos = this.wristPos;
  wristPos.copy(WRIST_CONTROLLER_OFFSET);
  wristPos.applyQuaternion(wristQ);
  wristPos.add(ELBOW_WRIST_OFFSET);
  wristPos.applyQuaternion(elbowQ);
  wristPos.add(this.elbowPos);

  var offset = new THREE.Vector3().copy(ARM_EXTENSION_OFFSET);
  offset.multiplyScalar(extensionRatio);

  var position = new THREE.Vector3().copy(this.wristPos);
  position.add(offset);
  position.applyQuaternion(this.rootQ);

  var orientation = new THREE.Quaternion().copy(this.controllerQ);

  // Set the resulting pose orientation and position.
  this.pose.orientation.copy(orientation);
  this.pose.position.copy(position);

  this.lastTime = this.time;
};

// Returns the pose calculated by the model.
OrientationArmModel.prototype.getPose = function() {
  return this.pose;
};

// Debug methods for rendering the arm model.
OrientationArmModel.prototype.getForearmLength = function() {
  return ELBOW_WRIST_OFFSET.length();
};

OrientationArmModel.prototype.getElbowPosition = function() {
  var out = this.elbowPos.clone();
  return out.applyQuaternion(this.rootQ);
};

OrientationArmModel.prototype.getWristPosition = function() {
  var out = this.wristPos.clone();
  return out.applyQuaternion(this.rootQ);
};

OrientationArmModel.prototype.getHeadYawOrientation = function () {
  var headEuler = new THREE.Euler().setFromQuaternion(this.headQ, 'YXZ');
  headEuler.x = 0;
  headEuler.z = 0;
  var destinationQ = new THREE.Quaternion().setFromEuler(headEuler);
  return destinationQ;
};

// OrientationArmModel.prototype.clamp = function( value, min, max ) {
//   return Math.min(Math.max(value, min), max);
// };

OrientationArmModel.prototype.quatAngle = function( q1, q2 ) {
  var vec1 = new THREE.Vector3(0, 0, -1);
  var vec2 = new THREE.Vector3(0, 0, -1);
  vec1.applyQuaternion(q1);
  vec2.applyQuaternion(q2);
  return vec1.angleTo(vec2);
};

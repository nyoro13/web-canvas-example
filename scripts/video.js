'use strict';

const MyTest = {
  active: false,
  canvas: null,
  canvasCtx: null,
  video: null,
  init: function () {
    const that = this;
    this.canvas = document.querySelector('#main-canvas');
    this.canvasCtx = this.canvas.getContext('2d');
    this.video = document.createElement('video');

    const wrapper = document.querySelector('#canvas-wrapper');
    this.canvas.height = wrapper.offsetHeight;
    this.canvas.width = wrapper.offsetWidth;

    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      const constraints = {
        audio: false,
        video: {
          deviceId: {
            exact: null
          }
        }
      };
      for (const device of devices) {
        if (device.kind == 'videoinput') {
          constraints.video.deviceId.exact = device.deviceId;
        }
      }
      return constraints;
    }).then(function (constraints) {
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        that.video.srcObject = stream;
        that.video.onloadedmetadata = function (e) {
          that.video.play();
        }
        that.active = true;
      }).catch(console.error);
    }).catch(console.error);

    requestAnimationFrame(function (timestamp) {
      that.tick(timestamp);
    });
  },
  tick: function (timestamp) {
    const that = this;
    requestAnimationFrame(function (timestamp) {
      that.tick(timestamp);
    });
    if (!this.active) return;

    this.canvasCtx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
  },
}
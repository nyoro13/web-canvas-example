'use strict';

class OpenCVVideo {
  constructor(canvasId, videoElement) {
    this.fps = 60;
    this.canvasId = canvasId;
    this.cap = new cv.VideoCapture(videoElement);
    this.frame = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4)
    this.gray = new cv.Mat();
    this.corners = new cv.Mat();
    this.count = 0;
  }

  startTick(fps) {
    if (fps && fps > 0) {
      this.fps = fps;
    }
    this.tick();
  }

  tick() {
    this.count++;
    const begin = Date.now();
    this.cap.read(this.frame)
    cv.cvtColor(this.frame, this.gray, cv.COLOR_RGBA2GRAY);
    cv.goodFeaturesToTrack(this.gray, this.corners, 2000, 0.01, 15);
    console.log(this.corners);
    cv.imshow(this.canvasId, this.gray);

    if (this.count > 20) {
      return;
    }
    setTimeout(function (that) {
      that.tick();
    }, 1000 / this.fps - (Date.now() - begin), this)
  }
}
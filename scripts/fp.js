'use strict';

class OpenCVVideo {
  constructor(canvasId, videoElement) {
    this.fps = 60;
    this.video = videoElement;
    this.canvasId = canvasId;
    this.cap = new cv.VideoCapture(videoElement);
    this.frame = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4)
    this.gray = new cv.Mat();
    //this.equalize = new cv.Mat();
    this.corners = new cv.Mat();
  }

  startTick(fps) {
    if (fps && fps > 0) {
      this.fps = fps;
    }
    this.tick();
  }

  tick() {
    const begin = Date.now();
    this.cap.read(this.frame)
    cv.cvtColor(this.frame, this.gray, cv.COLOR_RGBA2GRAY);
    //cv.equalizeHist(this.gray, this.equalize);
    cv.goodFeaturesToTrack(this.gray, this.corners, 1500, 0.01, 15);
    //cv.goodFeaturesToTrack(this.equalize, this.corners, 1500, 0.01, 15);
    for (var i = 0; i < this.corners.rows; i++) {
      var [x, y] = [this.corners.floatAt(i, 0), this.corners.floatAt(i, 1)];
      cv.circle(this.frame, new cv.Point(x, y), 3, [255, 0, 0, 255], -1);
    }
    cv.imshow(this.canvasId, this.frame);

    setTimeout(function (that) {
      that.tick();
    }, 1000 / this.fps - (Date.now() - begin), this)
  }
}
'use strict';

class MeanShiftExample {
  constructor(canvasSelector, wrapperSelector) {
    const that = this;
    this.fps = 60;
    let canvas = document.querySelector(canvasSelector);
    let canvasWrapper = document.querySelector(wrapperSelector);
    canvas.width = canvasWrapper.offsetWidth;
    canvas.height = canvasWrapper.offsetHeight;
    //this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;

    this.video = document.createElement('video');

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    }).then(function (stream) {
      that.video.height = canvas.height;
      that.video.width = canvas.width;
      that.video.srcObject = stream;
      that.video.onloadedmetadata = function (e) {
        that.video.play();
        that.init();
      };
    }).catch(console.error);
  }

  init() {
    this.cap = new cv.VideoCapture(this.video);

    // take first frame of the video
    this.frame = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    this.cap.read(this.frame);

    // hardcode the initial location of window
    this.trackWindow = new cv.Rect(150, 60, 63, 125);

    // set up the ROI for tracking
    this.roi = this.frame.roi(this.trackWindow);
    this.hsvRoi = new cv.Mat();
    cv.cvtColor(this.roi, this.hsvRoi, cv.COLOR_RGBA2RGB);
    cv.cvtColor(this.hsvRoi, this.hsvRoi, cv.COLOR_RGB2HSV);
    this.mask = new cv.Mat();
    this.lowScalar = new cv.Scalar(30, 30, 0);
    this.highScalar = new cv.Scalar(180, 180, 180);
    this.low = new cv.Mat(this.hsvRoi.rows, this.hsvRoi.cols, this.hsvRoi.type(), this.lowScalar);
    this.high = new cv.Mat(this.hsvRoi.rows, this.hsvRoi.cols, this.hsvRoi.type(), this.highScalar);
    cv.inRange(this.hsvRoi, this.low, this.high, this.mask);
    this.roiHist = new cv.Mat();
    this.hsvRoiVec = new cv.MatVector();
    this.hsvRoiVec.push_back(this.hsvRoi);
    cv.calcHist(this.hsvRoiVec, [0], this.mask, this.roiHist, [180], [0, 180]);
    cv.normalize(this.roiHist, this.roiHist, 0, 255, cv.NORM_MINMAX);

    // delete useless mats.
    this.roi.delete();
    this.hsvRoi.delete();
    this.mask.delete();
    this.low.delete();
    this.high.delete();
    this.hsvRoiVec.delete();

    // Setup the termination criteria, either 10 iteration or move by atleast 1 pt
    this.termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

    this.hsv = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC3);
    this.dst = new cv.Mat();
    this.hsvVec = new cv.MatVector();
    this.hsvVec.push_back(this.hsv);

    setTimeout(function (that) {
      that.processVideo();
    }, 1000, this)
  }

  processVideo() {
    try {
      let begin = Date.now();

      // start processing.
      this.cap.read(this.frame);
      cv.cvtColor(this.frame, this.hsv, cv.COLOR_RGBA2RGB);
      cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);
      cv.calcBackProject(this.hsvVec, [0], this.roiHist, this.dst, [0, 180], 1);

      // Apply meanshift to get the new location
      // and...
      [, this.trackWindow] = cv.meanShift(this.dst, this.trackWindow, this.termCrit);

      let [x, y, w, h] = [this.trackWindow.x, this.trackWindow.y, this.trackWindow.width, this.trackWindow.height];
      cv.rectangle(this.frame, new cv.Point(x, y), new cv.Point(x + w, y + h), [255, 0, 0, 255], 2);
      cv.imshow('main-canvas', this.frame);
      //cv.imshow(this.frame, 'main-canvas');

      let delay = 1000 / this.fps - (Date.now() - begin);
      setTimeout(function (that) {
        that.processVideo();
      }, delay, this)
    } catch (err) {
      console.error(err);
    }
  }
}
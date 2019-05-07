class AkazeExample {
  constructor(canvasId, videoElement, imgId) {
    this.fps = 30;
    this.video = videoElement;
    this.canvasId = canvasId;
    this.cap = new cv.VideoCapture(videoElement);
    this.frame = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4)
    //this.gray = new cv.Mat();

    //this.akaze = new cv.AKAZE(cv.AKAZE_DESCRIPTOR_MLDB, 0, 3, 0.001, 4, 4, cv.KAZE_DIFF_PM_G2);
    this.akaze = new cv.AKAZE();

    this.mask = new cv.Mat();

    this.target = cv.imread(imgId);
    this.tKeypoint = new cv.KeyPointVector();
    this.tDescriptor = new cv.Mat();
    this.akaze.detectAndCompute(this.target, this.mask, this.tKeypoint, this.tDescriptor);

    this.fKeypoint = new cv.KeyPointVector();
    this.fDescriptor = new cv.Mat();

    this.matcher = new cv.DescriptorMatcher("BruteForce");
    //this.matcher = new cv.BFMatcher();
    this.matches = new cv.DMatchVector();

    this.dest = new cv.Mat();

    this.count = 0;
  }

  startTick(fps) {
    if (fps && fps > 0) {
      this.fps = fps;
    }
    this.tick();
  }

  tick() {
    const begin = Date.now();

    this.match();
    //this.test()

    /*
    this.count++;
    if (this.count > 4) {
      this.video.srcObject.getTracks().forEach(function (track) {
        track.stop();
      });
      return;
    }
    */

    setTimeout(function (that) {
      that.tick();
    }, 1000 / this.fps - (Date.now() - begin), this);
  }

  match() {
    this.cap.read(this.frame);
    this.akaze.detectAndCompute(this.frame, this.mask, this.fKeypoint, this.fDescriptor);
    this.matcher.match(this.tDescriptor, this.fDescriptor, this.matches);

    //cv.drawMatches(this.target, this.tKeypoint, this.frame, this.fKeypoint, this.matches, this.dest);
    for (var i = 0; i < this.matches.size(); i++) {
      if (this.matches.get(i).distance < 500) {
        cv.circle(this.frame, this.fKeypoint.get(this.matches.get(i).trainIdx).pt, 1, [255, 0, 0, 255], -1);
      }
    }

    cv.imshow(this.canvasId, this.frame);
    //cv.imshow(this.canvasId, this.dest);
  }

  test() {
    for (let i = 0; i < this.tKeypoint.size(); i++) {
      cv.circle(this.target, this.tKeypoint.get(i).pt, 3, [255, 0, 0, 255], -1);
    }
    cv.imshow(this.canvasId, this.target);
  }
}
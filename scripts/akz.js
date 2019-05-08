class AkazeExample {
  constructor(canvasId, videoElement, imgId) {
    this.fps = 30;
    this.video = videoElement;
    this.canvasId = canvasId;
    this.cap = new cv.VideoCapture(videoElement);
    this.gray = new cv.Mat();
    this.frame = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4)

    //this.detector = new cv.AgastFeatureDetector();
    //this.detector = new cv.AKAZE();
    //this.detector = new cv.BRISK();
    //this.detector = new cv.FastFeatureDetector();
    //this.detector = new cv.GFTTDetector();
    //this.detector = new cv.KAZE();
    //this.detector = new cv.MSER();
    this.detector = new cv.ORB();
    //this.detector = new cv.SimpleBlobDetector();

    //this.extractor = new cv.AgastFeatureDetector();
    //this.extractor = new cv.AKAZE();
    //this.extractor = new cv.BRISK();
    //this.extractor = new cv.FastFeatureDetector();
    //this.extractor = new cv.GFTTDetector();
    //this.extractor = new cv.KAZE();
    //this.extractor = new cv.MSER();
    this.extractor = new cv.ORB();
    //this.extractor = new cv.SimpleBlobDetector();

    this.mask = new cv.Mat();

    this.target = cv.imread(imgId);
    this.tKeypoint = new cv.KeyPointVector();
    this.tDescriptor = new cv.Mat();
    this.detector.detect(this.target, this.tKeypoint);
    this.extractor.compute(this.target, this.tKeypoint, this.tDescriptor);

    this.fKeypoint = new cv.KeyPointVector();
    this.fDescriptor = new cv.Mat();

    this.matcher = new cv.DescriptorMatcher("BruteForce");
    //this.matcher = new cv.BFMatcher();
    this.matches = new cv.DMatchVector();
    this.matchesVector = new cv.DMatchVectorVector();

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

    setTimeout(function (that) {
      that.tick();
    }, 1000 / this.fps - (Date.now() - begin), this);
  }

  match() {
    this.cap.read(this.frame);
    //this.akaze.detectAndCompute(this.frame, this.mask, this.fKeypoint, this.fDescriptor);
    this.detector.detect(this.frame, this.fKeypoint);
    this.extractor.compute(this.frame, this.fKeypoint, this.fDescriptor);
    //this.matcher.match(this.tDescriptor, this.fDescriptor, this.matches);
    this.matcher.knnMatch(this.tDescriptor, this.fDescriptor, this.matchesVector, 2);

    //cv.drawMatches(this.target, this.tKeypoint, this.frame, this.fKeypoint, this.matches, this.dest);
    /*
    for (var i = 0; i < this.matches.size(); i++) {
      if (this.matches.get(i).distance < 400) {
        cv.circle(this.frame, this.fKeypoint.get(this.matches.get(i).trainIdx).pt, 1, [255, 0, 0, 255], -1);
      }
    }
    */
    let minX = null;
    let minY = null;
    let maxX = null;
    let maxY = null;
    let pt = null;
    for (var i = 0; i < this.matchesVector.size(); i++) {
      if (this.matchesVector.get(i).get(0).distance < this.matchesVector.get(i).get(1).distance * 0.5) {
        pt = this.fKeypoint.get(this.matchesVector.get(i).get(0).trainIdx).pt;
        if (minX == null || pt.x < minX) minX = pt.x;
        if (minY == null || pt.y < minY) minY = pt.y;
        if (maxX == null || maxX < pt.x) maxX = pt.x;
        if (maxY == null || maxY < pt.y) maxY = pt.y;
        cv.circle(this.frame, pt, 1, [255, 0, 0, 255], -1);
      }
    }

    if (minX != null) {
      cv.rectangle(this.frame, new cv.Point(minX, minY), new cv.Point(maxX, maxY), [255, 0, 0, 255], 2);
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
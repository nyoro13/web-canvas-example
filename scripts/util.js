const Util = {
  startVideo: function (width, height, videoPlayCallback) {
    const video = document.createElement('video');
    video.width = width;
    video.height = height;

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    }).then(function (stream) {
      video.srcObject = stream;
      video.onloadedmetadata = function (e) {
        video.play();
        if (videoPlayCallback) {
          videoPlayCallback(video);
        }
      }
    }).catch(console.error);
    return video;
  }
};
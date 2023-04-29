const handleStream = (stream, crop, callback) => {
  // Create video tag
  var video = document.createElement('video');

  // Hide it
  video.style.cssText = 'display:none;';
  
  // Onloaded event
  video.onloadedmetadata = function () {
      // Set original height
      video.style.height = this.videoHeight + 'px'; // videoHeight
      video.style.width = this.videoWidth + 'px'; // videoWidth

      // Capture
      video.play();

      // Create canvas
      var canvas = document.createElement('canvas');

      // Set Height
      canvas.width = crop.width;
      canvas.height = crop.height;

      // Hide it
      canvas.style.cssText = 'display:none;';

      var ctx = canvas.getContext('2d');

      // Draw video on canvas
      ctx.drawImage(video, crop.distanceX, crop.distanceY, crop.width, crop.height, 0, 0, crop.width, crop.height);
      //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (callback) {
          // Save screenshot to base64
          callback(canvas.toDataURL('image/jpeg'));
      }

      // Remove tags
      video.remove();
      canvas.remove();

      // Clean up
      try {
          // Destroy connect to stream
          stream.getTracks()[0].stop();
      } catch (e) {
        console.warn("Failed to clean up stream!")
      }
  }
  
  video.srcObject = stream;
  document.body.appendChild(video);
};

const handleError = (e) => {
  console.log(e);
};

export const takeScreenshot = async (crop, callback, set) => {
  // Determine screen
  let screenSelected = remote.screen.getDisplayNearestPoint({x: crop.x_bound, y: crop.y_bound})

  // Adjust crop for multiple displays and scale factor
  if(set) {
    crop.distanceX = Math.round((Math.abs(screenSelected.bounds.x - crop.distanceX) + 2) * screenSelected.scaleFactor)
    crop.distanceY = Math.round((Math.abs(screenSelected.bounds.y - crop.distanceY) + 26) * screenSelected.scaleFactor)
  }

  // Get Sources
  let sources = await desktopCapturer.getSources({ types: ['window', 'screen'] })
  console.log(sources);
  
  // Select correct source and set up stream
  for (const source of sources) {
      if (source.display_id === screenSelected.id.toString()) {
          try{
              const stream = await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: {
                      mandatory: {
                          chromeMediaSource: 'desktop',
                          chromeMediaSourceId: source.id,
                          minWidth: 0,
                          maxWidth: 4000,
                          minHeight: 0,
                          maxHeight: 4000
                      }
                  }
              });

              handleStream(stream, crop, callback);
          } catch (e) {
              handleError(e);
          }
      }
  }
}
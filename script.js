const playPauseBtn = document.querySelector(".play-pause-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".full-screen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-thumb")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")
const timelineContainer = document.querySelector(".timeline-container")
const video = document.querySelector(".vlplay")
const vidposterImg = document.querySelector(".vidposter-img")
const watermarkImg = document.querySelector(".watermark")
const langtrack = document.querySelector(".langtrack-btn")
const restrack = document.querySelector(".restrack-btn")
const restrackauto = document.querySelector(".restrack-auto")

document.addEventListener("keydown", e => {
  const tagName = document.activeElement.tagName.toLowerCase()

  if (tagName === "input") return

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return
    case "k":
      togglePlay()
      break
    case "f":
      toggleFullScreenMode()
      break
    case "t":
      toggleTheaterMode()
      break
    case "i":
      toggleMiniPlayerMode()
      break
    case "m":
      toggleMute()
      break
	case ",":
	video.pause()
      skip(-0.05)
      break
	case ".":
	video.pause()
      skip(0.05)
      break
    case "arrowleft":
    case "j":
      skip(-5)
      break
    case "arrowright":
    case "l":
      skip(5)
      break
    case "c":
      toggleCaptions()
      break
  }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const time = percent * video.duration;

  previewImg.currentTime = time; // Set preview thumbnail (part of scrubber) video time
  //console.log(time);
  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
	//console.log(time);
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percent);
    video.currentTime = time; // Set the video's current time based on the scrubber position
  }
}


// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed);
speedBtn.addEventListener("contextmenu", changePlaybackSpeed);

function changePlaybackSpeed(event) {
  event.preventDefault(); // no context menu

  let newPlaybackRate;

  if (event.button === 0) {
    // Left click - Increase playback speed
    newPlaybackRate = video.playbackRate + 0.25;
    if (newPlaybackRate > 2) {
      newPlaybackRate = 0.25;
    }
  } else if (event.button === 2) {
    // Right click - Decrease playback speed
    newPlaybackRate = video.playbackRate - 0.25;
    if (newPlaybackRate < 0.25) {
      newPlaybackRate = 2;
    }
  }

  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

// Resolution
const previewImgSrc = `assets/preview.mp4`  //TODO: go through all <sources> and figure out smallest res if possible
previewImg.src = previewImgSrc

function getCurrentSource() {
  // Iterate through each source element
  for (let i = 0; i < sourceElements.length; i++) {
    const source = sourceElements[i];

    // Check if the source matches the current video source
    if (video.currentSrc.endsWith(source.getAttribute('src'))) {
      return source;
    }
  }
  return null; // No matching source found
}

const sourceElements = video.querySelectorAll('source');

if (sourceElements.length <= 1) {
  restrack.style.display = 'none'; // there is nothing to change
}

const videoSourcesContainer = document.getElementById('videosources');

for (let i = 0; i < sourceElements.length; i++) {
  const source = sourceElements[i];
  const label = source.getAttribute('label');
  
  // Create a button element
  const button = document.createElement('a');
  button.textContent = label;
  
  // Add a click event listener to change video resolution
  button.addEventListener('click', createClickListener(label, source.getAttribute('src')));
  
  // Append the button to the video sources container
  videoSourcesContainer.appendChild(button);
}

function createClickListener(label, src) {
  return function() {
    newresSRC(label, src);
  };
}

function newresSRC(nnlabel, nnsrc) {
	showLoader();
  console.log("Playing " + nnlabel + " " + nnsrc + "DBG : "+video.currentTime+" <- curr time | duration -> "+video.duration);
  const  previousTime = video.currentTime;
  const  previousPBR = video.playbackRate;
  console.log(previousTime);
  video.src = nnsrc;
  video.currentTime = previousTime;
  video.playbackRate = previousPBR;
  console.log(video.currentTime);
  video.play();
  restrack.textContent = `${nnlabel}`;
}

restrackauto.addEventListener("click", changeVidResolutionAuto);
function changeVidResolutionAuto(event) {
  event.preventDefault(); // no context menu

console.log(video.currentSrc);
console.log(video.src); //sets src but starts playback from zero

previousTime = 0;
previousTime = video.currentTime;
video.src="assets/preview.mp4";
video.currentTime = previousTime;
video.play()

  let newResTrack;

newResTrack="N/A";

  restrackauto.textContent = `${newResTrack}`;
  restrackauto.style.display = 'none';
}

// Captions
const captions = video.textTracks[0]
captions.mode = "hidden"

/*
if (video.textTracks.length === 0 || hasLoadingFailed()) {
  captionsBtn.style.display = 'none';
}

function hasLoadingFailed() {
  const tracks = video.querySelectorAll('track');
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.src && track.readyState === 2) {
      return true; // Loading of at least one track has failed
    }
  }
  return false; // All tracks loaded successfully
}
}*/

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration)
  //tends to sometimes fail
})

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime)
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent)
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`
  }
}

function skip(duration) {
  video.currentTime += duration  // fails on chrome if on http://domain but not on file://
  // firefox is all gud
}

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

function toggleMute() {
  video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

if (!document.pictureInPictureEnabled || !video.requestPictureInPicture) {
  miniPlayerBtn.style.display = 'none';
}


function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture()
  } else {
    video.requestPictureInPicture()
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player")
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
  video.paused ? video.play() : video.pause()
  totalTimeElem.textContent = formatDuration(video.duration)
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})


// Buffering / Loading
const loader = document.querySelector('.loader');
video.addEventListener('waiting', showLoader);
video.addEventListener('progress', hideLoader);//
video.addEventListener('stalled', hideLoader);//
video.addEventListener('canplay', hideLoader);
video.addEventListener('suspend', hideLoader);
video.addEventListener('playing', hideLoader);
video.addEventListener('loadeddata', hideLoader);
video.addEventListener('loadedmetadata', hideLoader);
video.addEventListener('emptied', hideLoader);

try {
  video.addEventListener('loadeddata', () => {
    totalTimeElem.textContent = formatDuration(video.duration);
  });
} catch (e) {
  // Handle error or fallback behavior
  console.error('Error occurred while adding event listener:', e);
  // Fallback code or alternative approach
  // ...
}

vidposterImg.src = video.poster;
function showLoader() {
  loader.style.display = 'inherit';
  vidposterImg.style.display = 'inherit';
}

function hideLoader() {
  loader.style.display = 'none';
  vidposterImg.style.display = 'none';
}

/* HLS */

  if(Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource('https://media-files.vidstack.io/hls/index.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      video.play();
  });
 }
 // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
 // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
 // This is using the built-in support of the plain video element, without using hls.js.
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'https://media-files.vidstack.io/hls/index.m3u8';
    video.addEventListener('canplay',function() {
      video.play();
    });
  }
  
  // HLS.js event listener for when the manifest is loaded
hls.on(Hls.Events.MANIFEST_LOADED, function() {
  const levels = hls.levels; // Array of available quality levels

  // Create buttons for each quality level
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const button = document.createElement('a');
    button.textContent = level.height + 'p HLS';

    // Add a click event listener to change video quality
    button.addEventListener('click', function() {
      hls.currentLevel = i; // Switch to the selected quality level
    });

    // Append the button to the video sources container
    videoSourcesContainer.appendChild(button);
  }
});
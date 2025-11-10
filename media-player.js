const tracks = [
    {
        name: "Montagem Mysterious Game",
        src: "./assets/track1.mp3",
        cover: "./assets/track1_cover.png",
    },
];

// DOM elements
const playPauseBtn = document.getElementById("btn-play-pause");
const playPauseIcon = playPauseBtn.querySelector("path");
const prevBtn = document.getElementById("btn-previous-track");
const nextBtn = document.getElementById("btn-next-track");
const trackName = document.querySelector(".track-name");
const trackImage = document.querySelector(".track-image");
const currentTimeText = document.getElementById("track-time-current");
const totalTimeText = document.getElementById("track-time-total");
const progressBar = document.querySelector(".track-progress-bar-current");

let currentTrackIndex = 0;
let sound = null;
let isPlaying = false;
let progressInterval = null;

// SVG paths for play/pause
const PLAY_ICON =
    "M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712";
const PAUSE_ICON =
    "M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2m6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2";

// Format time mm:ss
function formatTime(secs) {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = Math.floor(secs - minutes * 60) || 0;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Load a track
function loadTrack(index) {
    if (sound) sound.unload();
    const track = tracks[index];

    trackName.textContent = track.name;
    trackImage.src = track.cover;
    currentTimeText.textContent = "0:00";
    progressBar.style.width = "0%";

    sound = new Howl({
        src: [track.src],
        html5: true,
        onload: () => {
            totalTimeText.textContent = formatTime(sound.duration());
        },
        onend: nextTrack,
    });

    // Set icon to "Play"
    updatePlayPauseIcon(false);
}

// Update play/pause icon
function updatePlayPauseIcon(isPlaying) {
    playPauseIcon.setAttribute("d", isPlaying ? PAUSE_ICON : PLAY_ICON);
}

// Play / Pause
function togglePlay() {
    if (!sound) return;
    if (isPlaying) {
        sound.pause();
        isPlaying = false;
        clearInterval(progressInterval);
    } else {
        sound.play();
        isPlaying = true;
        progressInterval = setInterval(updateProgress, 500);
    }
    updatePlayPauseIcon(isPlaying);
}

// Update time + progress bar
function updateProgress() {
    if (!sound) return;
    const seek = sound.seek() || 0;
    const duration = sound.duration() || 0;
    currentTimeText.textContent = formatTime(seek);
    totalTimeText.textContent = formatTime(duration);
    const progress = (seek / duration) * 100;
    progressBar.style.width = `${progress}%`;
}

// Skip to next track
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        sound.play();
        updatePlayPauseIcon(true);
    }
}

// Skip to previous track
function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        sound.play();
        updatePlayPauseIcon(true);
    }
}

// Events
playPauseBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

// Initialize
loadTrack(currentTrackIndex);

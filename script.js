const iconList = document.getElementById("iconList");
const grid = document.getElementById("grid");

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const applyBtn = document.getElementById("applyGrid");
const resetBtn = document.getElementById("resetGrid");

let draggedSrc = null;
let draggedFromCell = null;
const DEFAULT_ICON = `icons/Icon_Default.png`;

// Fit the whole .card into the viewport by scaling .app-wrapper
function fitToScreen() {
  const wrapper = document.querySelector('.app-wrapper');
  const card = wrapper.querySelector('.card');
  if (!card || !wrapper) return;

  // measure natural card size (without transform)
  // temporarily reset transform to measure correctly
  const prevTransform = wrapper.style.transform;
  wrapper.style.transform = 'translate(-50%, -50%) scale(1)';

  const cardRect = card.getBoundingClientRect();
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;

  // compute scale with a small padding factor
  const paddingFactor = 0.94;
  const scaleW = (vpW / cardRect.width) * paddingFactor;
  const scaleH = (vpH / cardRect.height) * paddingFactor;
  const scale = Math.min(1, scaleW, scaleH);

  wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', () => {
  // debounce-ish: schedule next frame
  requestAnimationFrame(fitToScreen);
});

/* ================= ICON LIST ================= */
for (let i = 1; i <= 9; i++) {
  const icon = document.createElement("div");
  icon.className = "icon-item";

  const img = document.createElement("img");
  img.src = `icons/Icon_0${i}.png`;
  img.draggable = true;

  icon.appendChild(img);
  iconList.appendChild(icon);

  // attach dragstart to the image itself (dragstart does not bubble)
  img.addEventListener("dragstart", (e) => {
    draggedSrc = img.src;
    draggedFromCell = null;
    // set drag data/ghost image for better UX
    try { e.dataTransfer.setData('text/plain', img.src); } catch (err) {}
  });
}

/* ================= GRID ================= */
function createGrid(rows, cols) {
  grid.innerHTML = "";
  // make columns responsive but keep the column count unchanged
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(80px, 1fr))`;

  const total = rows * cols;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;

    /* index label */
    const indexLabel = document.createElement("div");
    indexLabel.className = "cell-index";
    indexLabel.textContent = i + 1;
    cell.appendChild(indexLabel);

    // place default icon for empty cell
    placeIcon(cell, DEFAULT_ICON);

    /* drag events */
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
      cell.classList.add("drag-over");
    });

    cell.addEventListener("dragleave", () => {
      cell.classList.remove("drag-over");
    });

    cell.addEventListener("drop", () => {
      cell.classList.remove("drag-over");
      handleDrop(cell);
    });

    // click to open icon picker for this cell
    cell.addEventListener('click', (e) => {
      // don't open picker when clicking the remove button
      if (e.target.classList && e.target.classList.contains('remove-btn')) return;
      openIconPicker(cell);
    });

    grid.appendChild(cell);
  }

  // after grid changes, ensure layout fits screen
  requestAnimationFrame(fitToScreen);
}

/* ================= PLACE ICON ================= */
function placeIcon(cell, src) {
  // remove any existing image or remove button but keep the index label
  cell.querySelectorAll("img, .remove-btn").forEach(e => e.remove());

  const img = document.createElement("img");
  img.src = src;

  // default icon should not be draggable and should not show remove button
  if (src === DEFAULT_ICON) {
    img.draggable = false;
    cell.appendChild(img);
    return;
  }

  img.draggable = true;

  img.addEventListener("dragstart", () => {
    draggedSrc = img.src;
    draggedFromCell = cell;
  });

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "✕";
  removeBtn.onclick = () => {
    // when removing, replace with default icon instead of deleting the img element
    img.src = DEFAULT_ICON;
    removeBtn.remove();
    img.draggable = false;
  };

  cell.appendChild(img);
  cell.appendChild(removeBtn);
}

/* ================= ICON PICKER (click-to-choose) ================= */
function openIconPicker(cell) {
  const iconImgs = Array.from(document.querySelectorAll('.icon-item img'));
  const available = iconImgs.map(i => i.src);

  const overlay = document.createElement('div');
  overlay.className = 'icon-picker-overlay';

  const picker = document.createElement('div');
  picker.className = 'icon-picker';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-picker-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => overlay.remove());
  picker.appendChild(closeBtn);

  const gridDiv = document.createElement('div');
  gridDiv.className = 'icon-picker-grid';

  available.forEach(src => {
    const item = document.createElement('div');
    item.className = 'icon-picker-item';
    const img = document.createElement('img');
    img.src = src;
    item.appendChild(img);
    item.addEventListener('click', () => {
      placeIcon(cell, src);
      overlay.remove();
    });
    gridDiv.appendChild(item);
  });

  picker.appendChild(gridDiv);
  overlay.appendChild(picker);

  // close when clicking outside picker
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);

  // close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/* ================= DROP LOGIC ================= */
function handleDrop(targetCell) {
  if (!draggedSrc) return;

  const targetImg = targetCell.querySelector("img");

  // From ICON LIST → GRID
  if (!draggedFromCell) {
    // always place the dragged icon into the target cell (replace existing/default)
    placeIcon(targetCell, draggedSrc);
    return;
  }

  // GRID → GRID
  if (draggedFromCell === targetCell) return;

  const sourceImg = draggedFromCell.querySelector("img");

  if (targetImg) {
    // SWAP
    const tempSrc = targetImg.src;
    placeIcon(targetCell, sourceImg.src);
    placeIcon(draggedFromCell, tempSrc);
  } else {
    // MOVE
    placeIcon(targetCell, sourceImg.src);
    sourceImg.remove();
    draggedFromCell.querySelector(".remove-btn")?.remove();
  }
}

/* ================= CONTROLS ================= */
applyBtn.addEventListener("click", () => {
  const rows = parseInt(rowsInput.value);
  const cols = parseInt(colsInput.value);
  if (rows > 0 && cols > 0) createGrid(rows, cols);
});

resetBtn.addEventListener("click", () => {
  document.querySelectorAll(".grid-cell").forEach(cell => {
    placeIcon(cell, DEFAULT_ICON);
  });
});

/* ================= INIT ================= */
createGrid(
  parseInt(rowsInput.value),
  parseInt(colsInput.value)
);

// ensure initial fit after images/styles applied
window.addEventListener('load', () => requestAnimationFrame(fitToScreen));

/* ================= MUSIC PLAYER ================= */
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
// loop and shuffle buttons removed from UI
const seekBar = document.getElementById('seekBar');
const volumeControl = document.getElementById('volume');
const currentTrackLabel = document.getElementById('currentTrack');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let repeatPlaylist = true; // kept for internal behavior
let shuffleMode = false;

// Optional manual mapping from filename -> display name. Edit to customize titles.
const TRACK_NAME_MAP = {
  'track1.mp3': 'BGM Aurora',
  'track2.mp3': 'BGM Dreamland',
  'track3.mp3': 'BGM Moon Light',
  'track4.mp3': 'BGM My Farm',
};

// discover music files in musics/ folder named track1..track50 with common extensions
async function discoverPlaylist() {
  const exts = ['mp3','ogg','wav'];
  const found = [];
  for (let i=1;i<=50;i++) {
    let added = false;
    for (const ext of exts) {
      const url = `musics/track${i}.${ext}`;
      try {
        const resp = await fetch(url, { method: 'HEAD' });
        if (resp.ok) {
          found.push(url);
          added = true;
          break;
        }
      } catch (e) {
        // HEAD might fail on some servers; attempt a lightweight GET fallback
        try {
          const r2 = await fetch(url, { method: 'GET' });
          if (r2.ok) { found.push(url); added = true; break; }
        } catch (e2) {}
      }
    }
    if (!added) continue;
  }
  playlist = found;
  if (playlist.length > 0) {
      await loadTrack(0);
    return;
  }

  // If discovery found nothing, fall back to a sensible default file.
  // Some environments (file://, CORS) make HEAD/GET unreliable, so attempt the common filename.
  const fallback = 'musics/track1.mp3';
  playlist = [fallback];
    await loadTrack(0);
}

async function loadTrack(index) {
  if (!playlist || playlist.length === 0) {
    if (currentTrackLabel) currentTrackLabel.textContent = 'No track';
    audio.removeAttribute('src');
    return;
  }

  currentIndex = (index + playlist.length) % playlist.length;
  let url = playlist[currentIndex];

  // Try a HEAD request to detect 404 quickly. If HEAD fails (CORS/file:), fall back
  // to assigning the src and letting the audio element attempt to load.
  try {
    const resp = await fetch(url, { method: 'HEAD' });
    if (!resp.ok) {
      // try to find another available track in the playlist
      let found = -1;
      for (let off = 1; off < playlist.length; off++) {
        const idx = (currentIndex + off) % playlist.length;
        try {
          const r2 = await fetch(playlist[idx], { method: 'HEAD' });
          if (r2.ok) { found = idx; break; }
        } catch (err) {
          // ignore and continue
        }
      }
      if (found >= 0) {
        currentIndex = found;
        url = playlist[currentIndex];
      } else {
        if (currentTrackLabel) currentTrackLabel.textContent = `Not found (${resp.status})`;
        audio.removeAttribute('src');
        return;
      }
    }
  } catch (err) {
    // HEAD failed (likely CORS or file:). Proceed with assigning src and let audio try.
    console.warn('HEAD check failed for', url, err);
  }

  audio.src = url;
  // display nice name: prefer mapping, then auto-map `trackN.ext` -> 'Bài N', else filename
  const fileName = url.split('/').pop();
  let displayName = TRACK_NAME_MAP[fileName];
  if (!displayName) {
    const m = fileName.match(/^track(\d+)\.[^/.]+$/i);
    if (m) displayName = `Bài ${m[1]}`;
    else displayName = fileName.replace(/\.[^/.]+$/, '');
  }
  if (currentTrackLabel) currentTrackLabel.textContent = displayName;
  audio.load();
}

function playCurrent() {
  if (!audio.src) return;
  // handle the play() promise to catch autoplay restrictions
  const p = audio.play();
  if (p && p.then) {
    p.then(() => {
      isPlaying = !audio.paused;
      if (playPauseBtn) playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    }).catch((err) => {
      // autoplay prevented or other playback error
      isPlaying = false;
      if (playPauseBtn) playPauseBtn.textContent = '▶';
      console.warn('Playback failed or was blocked:', err);
    });
  } else {
    isPlaying = true;
    if (playPauseBtn) playPauseBtn.textContent = '⏸';
  }
  return p || Promise.resolve();
}

// set default volume to avoid silent playback on some setups
try { audio.volume = 0.5; } catch (e) {}

audio.addEventListener('error', (e) => {
  console.warn('Audio error', e, 'currentSrc=', audio.currentSrc || audio.src);
  if (window.location && window.location.protocol === 'file:') {
    console.warn('Site served via file:// — browsers often block media requests. Serve the site via HTTP (e.g., `npx http-server` or Python `http.server`)');
    if (currentTrackLabel) currentTrackLabel.textContent = 'File protocol — serve via HTTP';
    return;
  }

  const src = audio.currentSrc || audio.src || '(none)';
  if (currentTrackLabel) currentTrackLabel.textContent = 'Audio load error';

  // try a lightweight fetch to get HTTP status and CORS hints
  (async () => {
    try {
      const resp = await fetch(src, { method: 'HEAD' });
      console.warn('Fetch HEAD', src, 'status=', resp.status, 'ok=', resp.ok);
      if (!resp.ok) {
        if (currentTrackLabel) currentTrackLabel.textContent = `Not found (${resp.status})`;
      } else {
        if (currentTrackLabel) currentTrackLabel.textContent = 'Loaded but blocked';
      }
    } catch (err) {
      console.warn('Fetch test failed for audio src:', src, err);
      if (currentTrackLabel) currentTrackLabel.textContent = 'Load failed; see console';
    }
  })();
});

function pauseCurrent() {
  audio.pause();
  isPlaying = false;
  if (playPauseBtn) playPauseBtn.textContent = '▶';
}

function togglePlay() {
  if (isPlaying) pauseCurrent(); else playCurrent();
}

async function nextTrack() {
  if (shuffleMode && playlist.length>1) {
    let idx = Math.floor(Math.random()*playlist.length);
    if (idx===currentIndex) idx = (idx+1)%playlist.length;
    await loadTrack(idx);
    playCurrent();
    return;
  }
  if (currentIndex < playlist.length-1) {
    await loadTrack(currentIndex+1);
    playCurrent();
  } else if (repeatPlaylist) {
    await loadTrack(0);
    playCurrent();
  } else {
    pauseCurrent();
  }
}

async function prevTrack() {
  if (audio.currentTime>3) { audio.currentTime = 0; return; }
  if (currentIndex>0) await loadTrack(currentIndex-1);
  else await loadTrack(playlist.length-1);
  playCurrent();
}

// events
if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);
if (volumeControl) {
  // sync initial control value with audio element
  try { audio.volume = parseFloat(volumeControl.value); } catch (e) {}
  volumeControl.addEventListener('input', (e)=>{ audio.volume = parseFloat(e.target.value); });
}

if (seekBar) seekBar.addEventListener('input', (e) => {
  const pct = parseFloat(e.target.value);
  if (audio.duration) audio.currentTime = (pct/100) * audio.duration;
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    if (seekBar) seekBar.value = pct;
    if (currentTimeEl) {
      const m = Math.floor(audio.currentTime/60).toString().padStart(2,'0');
      const s = Math.floor(audio.currentTime%60).toString().padStart(2,'0');
      currentTimeEl.textContent = `${m}:${s}`;
    }
  }
});

audio.addEventListener('loadedmetadata', () => {
  if (durationTimeEl && audio.duration) {
    const m = Math.floor(audio.duration/60).toString().padStart(2,'0');
    const s = Math.floor(audio.duration%60).toString().padStart(2,'0');
    durationTimeEl.textContent = `${m}:${s}`;
  }
});

audio.addEventListener('ended', () => {
  // if audio element loop attribute is true, browser will loop single track
  if (audio.loop) return;
  nextTrack();
});

// initialize playlist discovery and attempt autoplay first track
discoverPlaylist().then(() => {
  // discoverPlaylist already loads first track if present; attempt unmuted autoplay
  if (playlist.length > 0) {
    const p = playCurrent();
    if (p && p.then) {
      p.catch((err) => {
        // autoplay unmuted blocked by browser; prompt user to click play
        console.warn('Autoplay unmuted failed:', err);
        if (currentTrackLabel) currentTrackLabel.textContent = 'Autoplay blocked — click play';
        if (playPauseBtn) {
          // ensure clicking play attempts playback again
          playPauseBtn.addEventListener('click', () => {
            playCurrent().catch(e => console.warn('Play after user click failed', e));
          }, { once: true });
        }
      });
    }
  }
});

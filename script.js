const iconList = document.getElementById("iconList");
const grid = document.getElementById("grid");

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const applyBtn = document.getElementById("applyGrid");
const resetBtn = document.getElementById("resetGrid");

const DEFAULT_ICON = `icons/Icon_Default.png`;

/* ================= POINTER DRAG STATE ================= */
let pointerDragging = false;
let dragSrc = null;          // src icon đang kéo
let dragFromCell = null;     // null = từ iconList
let dragPreview = null;

/* ================= DRAG PREVIEW ================= */
function createDragPreview(src, x, y) {
  dragPreview = document.createElement("img");
  dragPreview.src = src;
  dragPreview.className = "drag-preview";
  document.body.appendChild(dragPreview);
  moveDragPreview(x, y);
}

function moveDragPreview(x, y) {
  if (!dragPreview) return;
  dragPreview.style.left = x + "px";
  dragPreview.style.top = y + "px";
}

function removeDragPreview() {
  dragPreview?.remove();
  dragPreview = null;
}

/* ================= ICON LIST ================= */
for (let i = 1; i <= 9; i++) {
  const icon = document.createElement("div");
  icon.className = "icon-item";

  const img = document.createElement("img");
  img.src = `icons/Icon_0${i}.png`;

  icon.appendChild(img);
  iconList.appendChild(icon);

  img.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pointerDragging = true;
    dragSrc = img.src;
    dragFromCell = null;
    createDragPreview(dragSrc, e.clientX, e.clientY);
    img.setPointerCapture(e.pointerId);
  });
}

/* ================= GRID ================= */
function createGrid(rows, cols) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(80px, 1fr))`;

  const total = rows * cols;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";

    const indexLabel = document.createElement("div");
    indexLabel.className = "cell-index";
    indexLabel.textContent = i + 1;
    cell.appendChild(indexLabel);

    placeIcon(cell, DEFAULT_ICON);

    cell.addEventListener("click", (e) => {
      if (pointerDragging) return;
      if (e.target.classList.contains("remove-btn")) return;
      openIconPicker(cell); // ✅ giữ nguyên
    });

    grid.appendChild(cell);
  }
}

/* ================= PLACE ICON ================= */
function placeIcon(cell, src) {
  // giữ lại index label
  cell.querySelectorAll("img, .remove-btn").forEach(e => e.remove());

  const img = document.createElement("img");
  img.src = src;

  // default icon: không drag
  if (src === DEFAULT_ICON) {
    img.draggable = false;
    cell.appendChild(img);
    return;
  }

  img.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pointerDragging = true;
    dragSrc = img.src;
    dragFromCell = cell;
    createDragPreview(dragSrc, e.clientX, e.clientY);
    img.setPointerCapture(e.pointerId);
  });

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "✕";
  removeBtn.onclick = () => {
    placeIcon(cell, DEFAULT_ICON);
  };

  cell.appendChild(img);
  cell.appendChild(removeBtn);
}

/* ================= POINTER MOVE ================= */
document.addEventListener("pointermove", (e) => {
  if (!pointerDragging) return;
  moveDragPreview(e.clientX, e.clientY);
});

/* ================= POINTER UP (DROP) ================= */
document.addEventListener("pointerup", (e) => {
  if (!pointerDragging) return;

  pointerDragging = false;
  removeDragPreview();

  const cell = document
    .elementFromPoint(e.clientX, e.clientY)
    ?.closest(".grid-cell");

  if (!cell || !dragSrc) {
    dragSrc = null;
    dragFromCell = null;
    return;
  }

  // ICON LIST → GRID
  if (!dragFromCell) {
    placeIcon(cell, dragSrc);
  }
  // GRID → GRID
  else if (dragFromCell !== cell) {
    const targetImg = cell.querySelector("img");
    const srcImg = dragFromCell.querySelector("img");

    if (targetImg) {
      const temp = targetImg.src;
      placeIcon(cell, srcImg.src);
      placeIcon(dragFromCell, temp);
    } else {
      placeIcon(cell, srcImg.src);
      placeIcon(dragFromCell, DEFAULT_ICON);
    }
  }

  dragSrc = null;
  dragFromCell = null;
});

/* ================= ICON PICKER (GIỮ NGUYÊN BẢN CŨ) ================= */
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

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/* ================= CONTROLS ================= */
applyBtn.onclick = () => {
  const r = parseInt(rowsInput.value);
  const c = parseInt(colsInput.value);
  if (r > 0 && c > 0) createGrid(r, c);
};

resetBtn.onclick = () => {
  document.querySelectorAll(".grid-cell").forEach(c => {
    placeIcon(c, DEFAULT_ICON);
  });
};

/* ================= INIT ================= */
createGrid(
  parseInt(rowsInput.value),
  parseInt(colsInput.value)
);


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
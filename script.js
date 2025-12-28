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

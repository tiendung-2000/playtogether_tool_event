const iconList = document.getElementById("iconList");
const grid = document.getElementById("grid");

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const applyBtn = document.getElementById("applyGrid");
const resetBtn = document.getElementById("resetGrid");

let draggedSrc = null;
let draggedFromCell = null;
const DEFAULT_ICON = `icons/Icon_Default.png`;

/* ================= ICON LIST ================= */
for (let i = 1; i <= 9; i++) {
  const icon = document.createElement("div");
  icon.className = "icon-item";
  icon.draggable = true;

  const img = document.createElement("img");
  img.src = `icons/Icon_0${i}.png`;

  icon.appendChild(img);
  iconList.appendChild(icon);

  icon.addEventListener("dragstart", () => {
    draggedSrc = img.src;
    draggedFromCell = null;
  });
}

/* ================= GRID ================= */
function createGrid(rows, cols) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 150px)`;

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
    if (!targetImg) {
      placeIcon(targetCell, draggedSrc);
    }
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
    cell.querySelectorAll("img, .remove-btn").forEach(e => e.remove());
  });
});

/* ================= INIT ================= */
createGrid(
  parseInt(rowsInput.value),
  parseInt(colsInput.value)
);

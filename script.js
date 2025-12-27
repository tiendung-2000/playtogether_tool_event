const iconList = document.getElementById("iconList");
const grid = document.getElementById("grid");

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const applyBtn = document.getElementById("applyGrid");
const resetBtn = document.getElementById("resetGrid");

let draggedSrc = null;
let draggedFromCell = null;

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
    indexLabel.textContent = i;
    cell.appendChild(indexLabel);

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

    grid.appendChild(cell);
  }
}

/* ================= PLACE ICON ================= */
function placeIcon(cell, src) {
  cell.querySelectorAll("img, .remove-btn").forEach(e => e.remove());

  const img = document.createElement("img");
  img.src = src;
  img.draggable = true;

  img.addEventListener("dragstart", () => {
    draggedSrc = img.src;
    draggedFromCell = cell;
  });

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "✕";
  removeBtn.onclick = () => {
    img.remove();
    removeBtn.remove();
  };

  cell.appendChild(img);
  cell.appendChild(removeBtn);
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

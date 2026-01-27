const WORDS = [
  "ADEX",
  "BILLIONS",
  "NETWORK",
  "ATTESTATION",
  "PARTNERSHIP",
  "AURA",
];

const WORD_SET = new Set(WORDS.map((word) => word.toUpperCase()));

const gridElement = document.querySelector("#letterGrid");
const wordListElement = document.querySelector("#wordList");
const statusElement = document.querySelector("#status");

const grid = [
  ["O", "W", "T", "A", "I", "P"],
  ["K", "R", "S", "E", "R", "H"],
  ["A", "T", "N", "A", "U", "S"],
  ["P", "O", "T", "T", "T", "A"],
  ["I", "N", "I", "T", "S", "D"],
  ["B", "L", "L", "E", "E", "X"],
];
const foundWords = new Set();
const foundCells = new Set();

const selectionState = {
  isActive: false,
  path: [],
};

const renderWordList = () => {
  wordListElement.innerHTML = "";
  WORDS.forEach((word) => {
    const item = document.createElement("li");
    item.textContent = word;
    item.dataset.word = word;
    wordListElement.appendChild(item);
  });
};

const updateWordList = () => {
  WORDS.forEach((word) => {
    const item = wordListElement.querySelector(`[data-word="${word}"]`);
    if (item) {
      item.classList.toggle("found", foundWords.has(word));
    }
  });
};

const renderGrid = () => {
  const size = grid.length;
  gridElement.style.setProperty("--grid-size", size.toString());
  gridElement.innerHTML = "";

  grid.forEach((row, rowIndex) => {
    row.forEach((letter, columnIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      cell.dataset.row = rowIndex.toString();
      cell.dataset.col = columnIndex.toString();
      cell.setAttribute("role", "button");
      cell.setAttribute("aria-label", `Letter ${letter}`);
      gridElement.appendChild(cell);
    });
  });
};

const cellKey = (row, col) => `${row}-${col}`;

const getCellElement = (row, col) =>
  gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);

const clearSelectionHighlights = () => {
  selectionState.path.forEach(({ row, col }) => {
    const cell = getCellElement(row, col);
    if (cell) {
      cell.classList.remove("selected");
    }
  });
};

const applySelectionHighlights = () => {
  selectionState.path.forEach(({ row, col }) => {
    const cell = getCellElement(row, col);
    if (cell) {
      cell.classList.add("selected");
    }
  });
};

const startSelection = (row, col) => {
  clearSelectionHighlights();
  selectionState.isActive = true;
  selectionState.path = [{ row, col }];
  applySelectionHighlights();
};

const canExtendSelection = (row, col) => {
  const last = selectionState.path[selectionState.path.length - 1];
  if (!last) {
    return false;
  }

  const dx = col - last.col;
  const dy = row - last.row;

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    return false;
  }

  return true;
};

const extendSelection = (row, col) => {
  const last = selectionState.path[selectionState.path.length - 1];
  if (!last) {
    return;
  }

  const existingIndex = selectionState.path.findIndex(
    (cell) => cell.row === row && cell.col === col
  );
  if (existingIndex !== -1) {
    if (existingIndex === selectionState.path.length - 1) {
      return;
    }
    clearSelectionHighlights();
    selectionState.path = selectionState.path.slice(0, existingIndex + 1);
    applySelectionHighlights();
    return;
  }

  if (!canExtendSelection(row, col)) {
    return;
  }

  selectionState.path.push({ row, col });
  applySelectionHighlights();
};

const finalizeSelection = () => {
  if (!selectionState.isActive) {
    return;
  }

  const letters = selectionState.path.map(({ row, col }) => grid[row][col]);
  const word = letters.join("");
  const reversed = letters.slice().reverse().join("");
  const matchedWord = WORD_SET.has(word) ? word : WORD_SET.has(reversed) ? reversed : null;

  if (matchedWord && !foundWords.has(matchedWord)) {
    foundWords.add(matchedWord);
    selectionState.path.forEach(({ row, col }) => {
      const key = cellKey(row, col);
      if (!foundCells.has(key)) {
        foundCells.add(key);
        const cell = getCellElement(row, col);
        if (cell) {
          cell.classList.add("found");
        }
      }
    });
    statusElement.textContent = `Found ${matchedWord}!`;
  } else if (matchedWord) {
    statusElement.textContent = `${matchedWord} was already found.`;
  } else {
    statusElement.textContent = "Keep looking...";
  }

  clearSelectionHighlights();
  selectionState.isActive = false;
  selectionState.path = [];
  updateWordList();
};

const handlePointerDown = (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) {
    return;
  }
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  startSelection(row, col);
  gridElement.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!selectionState.isActive) {
    return;
  }
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const cell = target?.closest(".cell");
  if (!cell) {
    return;
  }
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  extendSelection(row, col);
};

const handlePointerUp = () => {
  finalizeSelection();
};

renderWordList();
renderGrid();
updateWordList();
statusElement.textContent = "Start dragging to select letters.";

gridElement.addEventListener("pointerdown", handlePointerDown);
gridElement.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("pointercancel", handlePointerUp);

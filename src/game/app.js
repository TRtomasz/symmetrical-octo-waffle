const WORDS = [
  "ADEX",
  "BILLIONS",
  "NETWORK",
  "ATTESTATION",
  "PARTNERSHIP",
  "AURA",
];

const WORD_PATHS = {
  ATTESTATION: [
    { row: 3, col: 5 },
    { row: 3, col: 4 },
    { row: 4, col: 3 },
    { row: 5, col: 3 },
    { row: 4, col: 4 },
    { row: 3, col: 3 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 4, col: 2 },
    { row: 3, col: 1 },
    { row: 4, col: 1 },
  ],
  PARTNERSHIP: [
    { row: 3, col: 0 },
    { row: 2, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 2, col: 5 },
    { row: 1, col: 5 },
    { row: 0, col: 4 },
    { row: 0, col: 5 },
  ],
  ADEX: [
    { row: 3, col: 5 },
    { row: 4, col: 5 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
  ],
  BILLIONS: [
    { row: 5, col: 0 },
    { row: 4, col: 0 },
    { row: 5, col: 1 },
    { row: 5, col: 2 },
    { row: 4, col: 2 },
    { row: 3, col: 1 },
    { row: 2, col: 2 },
    { row: 1, col: 2 },
  ],
  AURA: [
    { row: 2, col: 3 },
    { row: 2, col: 4 },
    { row: 1, col: 4 },
    { row: 0, col: 3 },
  ],
  NETWORK: [
    { row: 2, col: 2 },
    { row: 1, col: 3 },
    { row: 0, col: 2 },
    { row: 0, col: 1 },
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 0 },
  ],
};

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
const cellUsageCounts = new Map();

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

const initializeCellUsageCounts = () => {
  cellUsageCounts.clear();
  WORDS.forEach((word) => {
    const path = WORD_PATHS[word];
    if (!path) {
      return;
    }
    path.forEach(({ row, col }) => {
      const key = cellKey(row, col);
      cellUsageCounts.set(key, (cellUsageCounts.get(key) ?? 0) + 1);
    });
  });

  grid.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      const key = cellKey(rowIndex, colIndex);
      if (!cellUsageCounts.has(key)) {
        cellUsageCounts.set(key, 1);
      }
    });
  });
};

const pathsMatch = (path, targetPath) =>
  path.length === targetPath.length &&
  path.every(
    (cell, index) =>
      cell.row === targetPath[index].row && cell.col === targetPath[index].col
  );

const findMatchingWord = (path) => {
  for (const word of WORDS) {
    const wordPath = WORD_PATHS[word];
    if (!wordPath) {
      continue;
    }
    if (pathsMatch(path, wordPath) || pathsMatch(path, wordPath.slice().reverse())) {
      return word;
    }
  }
  return null;
};

const updateGridAvailability = () => {
  grid.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      const cell = getCellElement(rowIndex, colIndex);
      if (!cell) {
        return;
      }
      const count = cellUsageCounts.get(cellKey(rowIndex, colIndex)) ?? 0;
      const isActive = count > 0;
      cell.classList.toggle("inactive", !isActive);
    });
  });
};

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

  const matchedWord = findMatchingWord(selectionState.path);

  if (matchedWord && !foundWords.has(matchedWord)) {
    foundWords.add(matchedWord);
    WORD_PATHS[matchedWord]?.forEach(({ row, col }) => {
      const key = cellKey(row, col);
      const count = cellUsageCounts.get(key) ?? 0;
      cellUsageCounts.set(key, Math.max(0, count - 1));
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
  updateGridAvailability();
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
initializeCellUsageCounts();
updateWordList();
updateGridAvailability();
statusElement.textContent = "Start dragging to select letters.";

gridElement.addEventListener("pointerdown", handlePointerDown);
gridElement.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("pointercancel", handlePointerUp);

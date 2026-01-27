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

let audioContext;

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
      const connectorLayer = document.createElement("div");
      connectorLayer.className = "cell-connectors";
      const letterSpan = document.createElement("span");
      letterSpan.className = "cell-letter";
      letterSpan.textContent = letter;
      cell.appendChild(connectorLayer);
      cell.appendChild(letterSpan);
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

const directionFromDelta = (dx, dy) => {
  const key = `${dx},${dy}`;
  const directionMap = {
    "0,-1": "north",
    "1,-1": "north-east",
    "1,0": "east",
    "1,1": "south-east",
    "0,1": "south",
    "-1,1": "south-west",
    "-1,0": "west",
    "-1,-1": "north-west",
  };
  return directionMap[key] ?? null;
};

const addConnector = (cell, direction, variant) => {
  const connectorLayer = cell.querySelector(".cell-connectors");
  if (!connectorLayer) {
    return;
  }
  const connector = document.createElement("span");
  connector.className = `connector connector--${direction} connector--${variant}`;
  connectorLayer.appendChild(connector);
};

const clearHighlights = () => {
  gridElement.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected", "found");
    const connectorLayer = cell.querySelector(".cell-connectors");
    if (connectorLayer) {
      connectorLayer.innerHTML = "";
    }
  });
};

const isCellStillActive = ({ row, col }) =>
  (cellUsageCounts.get(cellKey(row, col)) ?? 0) > 0;

const applyPathHighlights = (path, variant) => {
  path.forEach((cellData, index) => {
    if (variant === "found" && !isCellStillActive(cellData)) {
      return;
    }
    const cell = getCellElement(cellData.row, cellData.col);
    if (!cell) {
      return;
    }
    cell.classList.add(variant);

    const next = path[index + 1];
    if (next) {
      if (!(variant === "found" && !isCellStillActive(next))) {
        const dx = next.col - cellData.col;
        const dy = next.row - cellData.row;
        const direction = directionFromDelta(dx, dy);
        if (direction) {
          addConnector(cell, direction, variant);
        }
      }
    }
    const prev = path[index - 1];
    if (prev) {
      if (!(variant === "found" && !isCellStillActive(prev))) {
        const dx = prev.col - cellData.col;
        const dy = prev.row - cellData.row;
        const direction = directionFromDelta(dx, dy);
        if (direction) {
          addConnector(cell, direction, variant);
        }
      }
    }
  });
};

const updateHighlights = () => {
  clearHighlights();
  foundWords.forEach((word) => {
    const path = WORD_PATHS[word];
    if (path) {
      applyPathHighlights(path, "found");
    }
  });
  if (selectionState.path.length > 0) {
    applyPathHighlights(selectionState.path, "selected");
  }
};

const playSuccessSound = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.25);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
};

const startSelection = (row, col) => {
  selectionState.isActive = true;
  selectionState.path = [{ row, col }];
  updateHighlights();
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
    selectionState.path = selectionState.path.slice(0, existingIndex + 1);
    updateHighlights();
    return;
  }

  if (!canExtendSelection(row, col)) {
    return;
  }

  selectionState.path.push({ row, col });
  updateHighlights();
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
    playSuccessSound();
  } else if (matchedWord) {
    statusElement.textContent = `${matchedWord} was already found.`;
  } else {
    statusElement.textContent = "Keep looking...";
  }

  selectionState.isActive = false;
  selectionState.path = [];
  updateWordList();
  updateGridAvailability();
  updateHighlights();
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
updateHighlights();
statusElement.textContent = "Start dragging to select letters.";

gridElement.addEventListener("pointerdown", handlePointerDown);
gridElement.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("pointercancel", handlePointerUp);

const WORDS = [
  "ADEX",
  "BILLIONS",
  "NETWORK",
  "ATTESTATION",
  "PARTNERSHIP",
  "AURA",
];

const WORD_SET = new Set(WORDS.map((word) => word.toUpperCase()));

const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: -1 },
];

const randomLetter = (random) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = Math.floor(random() * alphabet.length);
  return alphabet[index];
};

const longestWordLength = (words) =>
  words.reduce((max, word) => Math.max(max, word.length), 0);

const createEmptyGrid = (size) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

const canPlaceWord = (grid, word, startX, startY, direction) => {
  const size = grid.length;
  for (let i = 0; i < word.length; i += 1) {
    const x = startX + direction.dx * i;
    const y = startY + direction.dy * i;
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return false;
    }

    const cell = grid[y][x];
    if (cell !== null && cell !== word[i]) {
      return false;
    }
  }

  return true;
};

const placeWord = (grid, word, startX, startY, direction) => {
  for (let i = 0; i < word.length; i += 1) {
    const x = startX + direction.dx * i;
    const y = startY + direction.dy * i;
    grid[y][x] = word[i];
  }
};

const tryGenerateGrid = (words, size) => {
  const grid = createEmptyGrid(size);
  const maxAttempts = 1000;

  for (const word of words) {
    let placedWord = false;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const direction =
        DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);

      if (!canPlaceWord(grid, word, startX, startY, direction)) {
        continue;
      }

      placeWord(grid, word, startX, startY, direction);
      placedWord = true;
      break;
    }

    if (!placedWord) {
      return null;
    }
  }

  return grid.map((row) => row.map((cell) => cell ?? randomLetter(Math.random)));
};

const generateGrid = (words) => {
  const normalizedWords = words.map((word) => word.toUpperCase());
  const minSize = 4;
  const longest = longestWordLength(normalizedWords);
  let size = Math.max(minSize, longest);

  while (true) {
    const candidate = tryGenerateGrid(normalizedWords, size);
    if (candidate) {
      return candidate;
    }
    size += 1;
  }
};

const gridElement = document.querySelector("#letterGrid");
const wordListElement = document.querySelector("#wordList");
const statusElement = document.querySelector("#status");

const grid = generateGrid(WORDS);
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

  const previous = selectionState.path[selectionState.path.length - 2];
  if (previous && previous.row === row && previous.col === col) {
    selectionState.path.pop();
    clearSelectionHighlights();
    applySelectionHighlights();
    return;
  }

  if (selectionState.path.some((cell) => cell.row === row && cell.col === col)) {
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

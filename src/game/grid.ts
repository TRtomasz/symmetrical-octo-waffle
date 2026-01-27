export type Direction = {
  name: string;
  dx: number;
  dy: number;
};

export type Placement = {
  word: string;
  start: { x: number; y: number };
  direction: Direction;
};

export type GridOptions = {
  size?: number;
  directions?: Direction[];
  random?: () => number;
  maxAttempts?: number;
};

export const DIRECTIONS: Direction[] = [
  { name: "east", dx: 1, dy: 0 },
  { name: "west", dx: -1, dy: 0 },
  { name: "south", dx: 0, dy: 1 },
  { name: "north", dx: 0, dy: -1 },
  { name: "south-east", dx: 1, dy: 1 },
  { name: "south-west", dx: -1, dy: 1 },
  { name: "north-east", dx: 1, dy: -1 },
  { name: "north-west", dx: -1, dy: -1 },
];

const DEFAULT_MAX_ATTEMPTS = 1000;

const randomLetter = (random: () => number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = Math.floor(random() * alphabet.length);
  return alphabet[index];
};

const longestWordLength = (words: string[]): number =>
  words.reduce((max, word) => Math.max(max, word.length), 0);

const createEmptyGrid = (size: number): (string | null)[][] =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

const canPlaceWord = (
  grid: (string | null)[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction
): boolean => {
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

const placeWord = (
  grid: (string | null)[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction
): void => {
  for (let i = 0; i < word.length; i += 1) {
    const x = startX + direction.dx * i;
    const y = startY + direction.dy * i;
    grid[y][x] = word[i];
  }
};

export const generateGrid = (
  words: string[],
  options: GridOptions = {}
): { grid: string[][]; size: number; placed: Placement[] } => {
  const normalizedWords = words.map((word) => word.toUpperCase());
  const size = options.size ?? longestWordLength(normalizedWords);
  const grid = createEmptyGrid(size);
  const directions = options.directions ?? DIRECTIONS;
  const random = options.random ?? Math.random;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const placed: Placement[] = [];

  for (const word of normalizedWords) {
    let placedWord = false;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const direction = directions[Math.floor(random() * directions.length)];
      const startX = Math.floor(random() * size);
      const startY = Math.floor(random() * size);

      if (!canPlaceWord(grid, word, startX, startY, direction)) {
        continue;
      }

      placeWord(grid, word, startX, startY, direction);
      placed.push({ word, start: { x: startX, y: startY }, direction });
      placedWord = true;
      break;
    }

    if (!placedWord) {
      throw new Error(`Unable to place word: ${word}`);
    }
  }

  const filledGrid = grid.map((row) =>
    row.map((cell) => cell ?? randomLetter(random))
  );

  return { grid: filledGrid, size, placed };
};

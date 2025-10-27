// 2048 Game Logic Engine

export type Grid = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  grid: Grid;
  score: number;
  moves: number;
  gameOver: boolean;
  won: boolean;
}

const GRID_SIZE = 4;

// Initialize empty grid
export function createEmptyGrid(): Grid {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

// Add a random tile (2 or 4) to the grid
export function addRandomTile(grid: Grid): Grid {
  const emptyCells: Array<[number, number]> = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  if (emptyCells.length === 0) return grid;
  
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(r => [...r]);
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
  
  return newGrid;
}

// Initialize a new game
export function initializeGame(): GameState {
  let grid = createEmptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  
  return {
    grid,
    score: 0,
    moves: 0,
    gameOver: false,
    won: false,
  };
}

// Move and merge tiles
function slideRow(row: number[]): { row: number[]; score: number } {
  // Remove zeros
  let newRow = row.filter(val => val !== 0);
  let score = 0;
  
  // Merge adjacent equal tiles
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      score += newRow[i];
      newRow[i + 1] = 0;
    }
  }
  
  // Remove zeros again
  newRow = newRow.filter(val => val !== 0);
  
  // Pad with zeros
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }
  
  return { row: newRow, score };
}

// Rotate grid 90 degrees clockwise
function rotateGridClockwise(grid: Grid): Grid {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[col][GRID_SIZE - 1 - row] = grid[row][col];
    }
  }
  return newGrid;
}

// Rotate grid 90 degrees counter-clockwise
function rotateGridCounterClockwise(grid: Grid): Grid {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[GRID_SIZE - 1 - col][row] = grid[row][col];
    }
  }
  return newGrid;
}

// Check if grids are equal
function gridsEqual(grid1: Grid, grid2: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid1[row][col] !== grid2[row][col]) return false;
    }
  }
  return true;
}

// Check if any moves are possible
export function canMove(grid: Grid): boolean {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) return true;
    }
  }
  
  // Check for possible merges horizontally
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      if (grid[row][col] === grid[row][col + 1]) return true;
    }
  }
  
  // Check for possible merges vertically
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === grid[row + 1][col]) return true;
    }
  }
  
  return false;
}

// Check if player has won (reached 2048)
export function hasWon(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] >= 2048) return true;
    }
  }
  return false;
}

// Move tiles in a given direction
export function move(state: GameState, direction: Direction): GameState {
  let { grid, score, moves, won } = state;
  let newGrid = grid.map(r => [...r]);
  let addedScore = 0;
  let moved = false;
  
  // Transform grid based on direction
  if (direction === 'up') {
    newGrid = rotateGridCounterClockwise(newGrid);
  } else if (direction === 'down') {
    newGrid = rotateGridClockwise(newGrid);
  } else if (direction === 'right') {
    newGrid = newGrid.map(row => [...row].reverse());
  }
  
  // Slide all rows left
  for (let row = 0; row < GRID_SIZE; row++) {
    const result = slideRow(newGrid[row]);
    newGrid[row] = result.row;
    addedScore += result.score;
  }
  
  // Transform back
  if (direction === 'up') {
    newGrid = rotateGridClockwise(newGrid);
  } else if (direction === 'down') {
    newGrid = rotateGridCounterClockwise(newGrid);
  } else if (direction === 'right') {
    newGrid = newGrid.map(row => [...row].reverse());
  }
  
  // Check if anything moved
  moved = !gridsEqual(grid, newGrid);
  
  if (moved) {
    // Add random tile
    newGrid = addRandomTile(newGrid);
    score += addedScore;
    moves += 1;
    
    // Check win condition
    if (!won && hasWon(newGrid)) {
      won = true;
    }
    
    // Check game over
    const gameOver = !canMove(newGrid);
    
    return {
      grid: newGrid,
      score,
      moves,
      gameOver,
      won,
    };
  }
  
  return state;
}

// Get the highest tile value
export function getHighestTile(grid: Grid): number {
  let max = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] > max) {
        max = grid[row][col];
      }
    }
  }
  return max;
}


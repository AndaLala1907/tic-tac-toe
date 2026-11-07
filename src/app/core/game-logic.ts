import { Board, Cell, Mark } from '../models/game.models';

export const EMPTY_BOARD: Board = Object.freeze(Array<Cell>(9).fill(null));

export const WIN_LINES: readonly (readonly number[])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export function findWinningLine(board: Board): readonly number[] | null {
  return WIN_LINES.find(([a, b, c]) => board[a] !== null && board[a] === board[b] && board[a] === board[c]) ?? null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function placeMark(board: Board, index: number, symbol: Mark): Board {
  return board.map((cell, i) => (i === index ? symbol : cell));
}

export function otherSymbol(symbol: Mark): Mark {
  return symbol === 'X' ? 'O' : 'X';
}

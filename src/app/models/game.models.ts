export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = readonly Cell[];
export type Phase = 'setup' | 'playing' | 'finished';
export type GameCount = 1 | 3 | 5;

export const GAME_COUNTS: readonly GameCount[] = [1, 3, 5];

export interface Player {
  readonly name: string;
  readonly symbol: Mark;
}

export interface SetupValue {
  player1Name: string;
  player2Name: string;
  player1Symbol: Mark;
  totalGames: GameCount;
}

export interface Scores {
  /** Wins per player, indexed like `TournamentState.players`. */
  readonly wins: readonly [number, number];
  readonly draws: number;
}

export interface GameResult {
  /** Index of the winning player, or null for a draw. */
  readonly winner: 0 | 1 | null;
  readonly line: readonly number[] | null;
}

export interface TournamentState {
  readonly phase: Phase;
  readonly players: readonly [Player, Player] | null;
  readonly totalGames: GameCount;
  readonly currentGame: number;
  readonly board: Board;
  /** Index of the player whose turn it is. */
  readonly turn: 0 | 1;
  /** Index of the player who started the current game. */
  readonly starter: 0 | 1;
  readonly scores: Scores;
  readonly result: GameResult | null;
}

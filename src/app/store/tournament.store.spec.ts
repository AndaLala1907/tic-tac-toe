import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { STATE_STORAGE, STORAGE_KEY, StateStorage } from './state-storage';
import { findWinningLine, isBoardFull } from '../core/game-logic';
import { Board, SetupValue } from '../models/game.models';
import { TournamentStore } from './tournament.store';

const setup = (totalGames: 1 | 3 | 5 = 3): SetupValue => ({
  player1Name: 'Ana',
  player2Name: 'Beni',
  player1Symbol: 'X',
  totalGames,
});

/** Plays the moves in order; players alternate starting with the current turn. */
function playMoves(store: TournamentStore, moves: number[]): void {
  moves.forEach((m) => store.play(m));
}

// X (first mover) wins on the top row: X:0,1,2  O:3,4
const X_WINS_FIRST = [0, 3, 1, 4, 2];
// Full board, no winner.
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe('game logic', () => {
  it('detects rows, columns and diagonals', () => {
    const row: Board = ['X', 'X', 'X', null, null, null, null, null, null];
    const col: Board = ['O', null, null, 'O', null, null, 'O', null, null];
    const diag: Board = ['X', null, null, null, 'X', null, null, null, 'X'];
    expect(findWinningLine(row)).toEqual([0, 1, 2]);
    expect(findWinningLine(col)).toEqual([0, 3, 6]);
    expect(findWinningLine(diag)).toEqual([0, 4, 8]);
  });

  it('returns null when there is no winner and detects a full board', () => {
    const full: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(findWinningLine(full)).toBeNull();
    expect(isBoardFull(full)).toBeTrue();
  });
});

/** In-memory stand-in for localStorage. */
function fakeStorage(initial: Record<string, string> = {}): StateStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => void (data[key] = value),
    removeItem: (key) => void delete data[key],
  };
}

function createStore(storage: StateStorage): TournamentStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: STATE_STORAGE, useValue: storage }] });
  return TestBed.inject(TournamentStore);
}

describe('TournamentStore', () => {
  let store: TournamentStore;
  let storage: ReturnType<typeof fakeStorage>;

  beforeEach(() => {
    storage = fakeStorage();
    store = createStore(storage);
  });

  describe('persistence', () => {
    it('saves progress and restores it in a new store instance', () => {
      store.startTournament(setup());
      playMoves(store, X_WINS_FIRST);

      const restored = createStore(storage);
      expect(restored.snapshot.phase).toBe('playing');
      expect(restored.snapshot.scores.wins).toEqual([1, 0]);
      expect(restored.snapshot.players?.[0].name).toBe('Ana');
    });

    it('clears the saved tournament on newTournament()', () => {
      store.startTournament(setup());
      store.newTournament();
      expect(storage.data[STORAGE_KEY]).toBeUndefined();
    });

    it('ignores corrupted saved data', () => {
      const restored = createStore(fakeStorage({ [STORAGE_KEY]: '{not json' }));
      expect(restored.snapshot.phase).toBe('setup');
    });

    it('works when storage is unavailable', () => {
      const restored = createStore(null as unknown as StateStorage);
      restored.startTournament(setup());
      expect(restored.snapshot.phase).toBe('playing');
    });
  });

  it('assigns the opposite symbol to player 2', () => {
    store.startTournament({ ...setup(), player1Symbol: 'O' });
    expect(store.snapshot.players?.[1].symbol).toBe('X');
  });

  it('records a win and ignores moves after the game ended', () => {
    store.startTournament(setup());
    playMoves(store, X_WINS_FIRST);
    expect(store.snapshot.scores.wins).toEqual([1, 0]);
    store.play(8);
    expect(store.snapshot.board[8]).toBeNull();
  });

  it('ignores a move on an occupied cell', () => {
    store.startTournament(setup());
    store.play(0);
    store.play(0);
    expect(store.snapshot.turn).toBe(1);
  });

  it('counts draws separately', () => {
    store.startTournament(setup());
    playMoves(store, DRAW);
    expect(store.snapshot.scores).toEqual({ wins: [0, 0], draws: 1 });
    expect(store.snapshot.result?.winner).toBeNull();
  });

  it('resets the board and alternates the starting player each game', () => {
    store.startTournament(setup());
    playMoves(store, X_WINS_FIRST);
    store.nextGame();
    expect(store.snapshot.currentGame).toBe(2);
    expect(store.snapshot.board.every((c) => c === null)).toBeTrue();
    expect(store.snapshot.turn).toBe(1);
    expect(store.snapshot.starter).toBe(1);
    // Player 2 (O) starts game 2 and wins on the top row.
    playMoves(store, X_WINS_FIRST);
    expect(store.snapshot.scores.wins).toEqual([1, 1]);
    store.nextGame();
    expect(store.snapshot.starter).toBe(0);
  });

  it('finishes after the last game and declares the overall winner', async () => {
    store.startTournament(setup(1));
    playMoves(store, X_WINS_FIRST);
    store.nextGame();
    expect(await firstValueFrom(store.phase$)).toBe('finished');
    expect(await firstValueFrom(store.tournamentWinner$)).toBe(0);
  });

  it('reports a tie when wins are equal', async () => {
    store.startTournament(setup(1));
    playMoves(store, DRAW);
    store.nextGame();
    expect(await firstValueFrom(store.tournamentWinner$)).toBeNull();
  });

  it('starts a fresh tournament on newTournament()', () => {
    store.startTournament(setup());
    playMoves(store, X_WINS_FIRST);
    store.newTournament();
    expect(store.snapshot.phase).toBe('setup');
    expect(store.snapshot.scores.wins).toEqual([0, 0]);
  });
});

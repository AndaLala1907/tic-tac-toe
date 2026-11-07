import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, skip } from 'rxjs/operators';
import { EMPTY_BOARD, findWinningLine, isBoardFull, otherSymbol, placeMark } from '../core/game-logic';
import { Player, Scores, SetupValue, TournamentState } from '../models/game.models';
import { STATE_STORAGE, readState, writeState } from './state-storage';

const INITIAL_SCORES: Scores = { wins: [0, 0], draws: 0 };

const INITIAL_STATE: TournamentState = {
  phase: 'setup',
  players: null,
  totalGames: 3,
  currentGame: 1,
  board: EMPTY_BOARD,
  turn: 0,
  starter: 0,
  scores: INITIAL_SCORES,
  result: null,
};

/**
 * Minimal RxJS store: a single immutable state in a BehaviorSubject,
 * mutated only through the action methods below, read through selectors.
 * Every change is persisted, so a page refresh resumes the tournament.
 */
@Injectable({ providedIn: 'root' })
export class TournamentStore {
  private readonly storage = inject(STATE_STORAGE);
  private readonly state$ = new BehaviorSubject<TournamentState>(readState(this.storage) ?? INITIAL_STATE);

  constructor() {
    // skip(1): do not write back the value we just loaded.
    this.state$.pipe(skip(1)).subscribe((state) => writeState(this.storage, state));
  }

  // ---- selectors ----
  readonly phase$ = this.select((s) => s.phase);
  readonly players$ = this.select((s) => s.players);
  readonly board$ = this.select((s) => s.board);
  readonly scores$ = this.select((s) => s.scores);
  readonly result$ = this.select((s) => s.result);
  readonly currentGame$ = this.select((s) => s.currentGame);
  readonly totalGames$ = this.select((s) => s.totalGames);
  readonly turn$ = this.select((s) => s.turn);
  readonly isLastGame$ = this.select((s) => s.currentGame >= s.totalGames);
  readonly currentPlayer$ = this.select((s) => (s.players ? s.players[s.turn] : null));
  /** Index of the tournament winner once finished, null for a tie. */
  readonly tournamentWinner$ = this.select((s) => {
    const [a, b] = s.scores.wins;
    return a === b ? null : a > b ? 0 : 1;
  });

  get snapshot(): TournamentState {
    return this.state$.value;
  }

  // ---- actions ----
  startTournament(setup: SetupValue): void {
    const p1: Player = { name: setup.player1Name.trim(), symbol: setup.player1Symbol };
    const p2: Player = { name: setup.player2Name.trim(), symbol: otherSymbol(setup.player1Symbol) };
    this.state$.next({
      ...INITIAL_STATE,
      phase: 'playing',
      players: [p1, p2],
      totalGames: setup.totalGames,
    });
  }

  play(index: number): void {
    const s = this.snapshot;
    if (s.phase !== 'playing' || s.result || !s.players || s.board[index] !== null) {
      return;
    }
    const board = placeMark(s.board, index, s.players[s.turn].symbol);
    const line = findWinningLine(board);

    if (line) {
      const wins: [number, number] = [...s.scores.wins];
      wins[s.turn] += 1;
      this.state$.next({ ...s, board, scores: { ...s.scores, wins }, result: { winner: s.turn, line } });
    } else if (isBoardFull(board)) {
      this.state$.next({
        ...s,
        board,
        scores: { ...s.scores, draws: s.scores.draws + 1 },
        result: { winner: null, line: null },
      });
    } else {
      this.state$.next({ ...s, board, turn: s.turn === 0 ? 1 : 0 });
    }
  }

  /** Resets the board for the next round and alternates who starts. */
  nextGame(): void {
    const s = this.snapshot;
    if (!s.result) return;
    if (s.currentGame >= s.totalGames) {
      this.state$.next({ ...s, phase: 'finished' });
      return;
    }
    const starter = s.starter === 0 ? 1 : 0;
    this.state$.next({ ...s, currentGame: s.currentGame + 1, board: EMPTY_BOARD, result: null, starter, turn: starter });
  }

  newTournament(): void {
    this.state$.next(INITIAL_STATE);
  }

  private select<T>(selector: (s: TournamentState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }
}

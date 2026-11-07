import { InjectionToken } from '@angular/core';
import { TournamentState } from '../models/game.models';

/** The subset of the Web Storage API the store needs. */
export type StateStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Where the tournament is persisted. Defaults to localStorage, or null when it is
 * unavailable (private mode, blocked cookies). Tests can provide a fake.
 */
export const STATE_STORAGE = new InjectionToken<StateStorage | null>('STATE_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return localStorage;
    } catch {
      return null;
    }
  },
});

/** Bump the version when the shape of TournamentState changes. */
export const STORAGE_KEY = 'tic-tac-toe:tournament:v1';

/** Loosely checks that parsed JSON really looks like a TournamentState. */
export function isTournamentState(value: unknown): value is TournamentState {
  const s = value as Partial<TournamentState> | null;
  return (
    !!s &&
    ['setup', 'playing', 'finished'].includes(s.phase as string) &&
    Array.isArray(s.board) &&
    s.board.length === 9 &&
    Array.isArray(s.scores?.wins) &&
    typeof s.currentGame === 'number' &&
    typeof s.totalGames === 'number' &&
    (s.phase === 'setup' || (Array.isArray(s.players) && s.players.length === 2))
  );
}

export function readState(storage: StateStorage | null): TournamentState | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isTournamentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeState(storage: StateStorage | null, state: TournamentState): void {
  try {
    if (state.phase === 'setup') {
      storage?.removeItem(STORAGE_KEY);
    } else {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Storage full or blocked: the game keeps working, it just will not survive a refresh.
  }
}

import { TestBed } from '@angular/core/testing';
import { Setup } from './setup';
import { STATE_STORAGE } from '../../store/state-storage';
import { TournamentStore } from '../../store/tournament.store';

describe('Setup form', () => {
  let component: Setup;
  let store: TournamentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Setup],
      providers: [{ provide: STATE_STORAGE, useValue: null }],
    });
    component = TestBed.createComponent(Setup).componentInstance;
    store = TestBed.inject(TournamentStore);
  });

  it('is invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('rejects identical names regardless of case and spacing', () => {
    component.form.patchValue({ player1Name: 'Ana', player2Name: '  ana ' });
    expect(component.form.hasError('sameNames')).toBeTrue();
  });

  it('rejects whitespace-only names', () => {
    component.form.patchValue({ player1Name: '   ', player2Name: 'Beni' });
    expect(component.form.controls.player1Name.hasError('blank')).toBeTrue();
  });

  it('starts the tournament with trimmed names when valid', () => {
    component.form.patchValue({ player1Name: ' Ana ', player2Name: 'Beni', player1Symbol: 'O', totalGames: 5 });
    component.submit();
    expect(store.snapshot.phase).toBe('playing');
    expect(store.snapshot.players?.[0]).toEqual({ name: 'Ana', symbol: 'O' });
    expect(store.snapshot.players?.[1].symbol).toBe('X');
    expect(store.snapshot.totalGames).toBe(5);
  });

  it('does not start when invalid', () => {
    component.submit();
    expect(store.snapshot.phase).toBe('setup');
  });
});

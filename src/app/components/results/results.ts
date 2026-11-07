import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { TournamentStore } from '../../store/tournament.store';
import { Scoreboard } from '../scoreboard/scoreboard';

@Component({
  selector: 'app-results',
  imports: [AsyncPipe, Scoreboard],
  templateUrl: './results.html',
  styleUrl: './results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Results {
  readonly store = inject(TournamentStore);

  readonly vm$ = combineLatest({
    players: this.store.players$,
    scores: this.store.scores$,
    totalGames: this.store.totalGames$,
    winner: this.store.tournamentWinner$,
  }).pipe(map((vm) => ({ ...vm, winnerPlayer: vm.winner != null && vm.players ? vm.players[vm.winner] : null })));
}

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { TournamentStore } from '../../store/tournament.store';
import { BoardComponent } from '../board/board';
import { Scoreboard } from '../scoreboard/scoreboard';

@Component({
  selector: 'app-game',
  imports: [AsyncPipe, BoardComponent, Scoreboard],
  templateUrl: './game.html',
  styleUrl: './game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Game {
  readonly store = inject(TournamentStore);

  /** Single view-model stream so the template subscribes once. */
  readonly vm$ = combineLatest({
    players: this.store.players$,
    scores: this.store.scores$,
    board: this.store.board$,
    result: this.store.result$,
    turn: this.store.turn$,
    currentGame: this.store.currentGame$,
    totalGames: this.store.totalGames$,
    isLastGame: this.store.isLastGame$,
  }).pipe(
    map((vm) => ({
      ...vm,
      winnerName: vm.result?.winner != null && vm.players ? vm.players[vm.result.winner].name : null,
    })),
  );
}

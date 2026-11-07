import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Game } from './components/game/game';
import { Results } from './components/results/results';
import { Setup } from './components/setup/setup';
import { TournamentStore } from './store/tournament.store';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, Setup, Game, Results],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly phase$ = inject(TournamentStore).phase$;
}

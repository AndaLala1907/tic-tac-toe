import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Player, Scores } from '../../models/game.models';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Scoreboard {
  readonly players = input.required<readonly [Player, Player]>();
  readonly scores = input.required<Scores>();
  /** Index of the player whose turn it is, highlighted while a game is running. */
  readonly activePlayer = input<0 | 1 | null>(null);
}

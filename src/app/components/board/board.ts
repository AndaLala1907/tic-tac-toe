import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Board } from '../../models/game.models';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  readonly board = input.required<Board>();
  readonly winningLine = input<readonly number[] | null>(null);
  readonly disabled = input(false);
  readonly cellClick = output<number>();

  isWinning(index: number): boolean {
    return this.winningLine()?.includes(index) ?? false;
  }
}

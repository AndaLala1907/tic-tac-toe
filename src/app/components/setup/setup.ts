import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { GAME_COUNTS, GameCount, Mark, SetupValue } from '../../models/game.models';
import { TournamentStore } from '../../store/tournament.store';

/** Group-level validator: player names must differ (case-insensitive, trimmed). */
export function distinctNames(group: AbstractControl): ValidationErrors | null {
  const a = String(group.get('player1Name')?.value ?? '').trim().toLowerCase();
  const b = String(group.get('player2Name')?.value ?? '').trim().toLowerCase();
  return a && b && a === b ? { sameNames: true } : null;
}

/** Rejects whitespace-only input, which `Validators.required` lets through. */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0 ? { blank: true } : null;
}

@Component({
  selector: 'app-setup',
  imports: [ReactiveFormsModule],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Setup {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly store = inject(TournamentStore);

  readonly gameCounts = GAME_COUNTS;
  readonly marks: readonly Mark[] = ['X', 'O'];

  readonly form = this.fb.group(
    {
      player1Name: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(20)]],
      player2Name: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(20)]],
      player1Symbol: ['X' as Mark, Validators.required],
      totalGames: [3 as GameCount, Validators.required],
    },
    { validators: distinctNames },
  );

  get p1Symbol(): Mark {
    return this.form.controls.player1Symbol.value;
  }

  get p2Symbol(): Mark {
    return this.p1Symbol === 'X' ? 'O' : 'X';
  }

  showError(name: 'player1Name' | 'player2Name'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  showSameNames(): boolean {
    const { player1Name, player2Name } = this.form.controls;
    return this.form.hasError('sameNames') && (player1Name.touched || player2Name.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.startTournament(this.form.getRawValue() as SetupValue);
  }
}

# Tic Tac Toe – Tournament

Angular 20 app: two players, multi-round tournament (1, 3 or 5 games) with score tracking.

## Run

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Karma + Jasmine)
npm run build
```

## Architecture

```
src/app
├── models/       types (Player, TournamentState, ...)
├── core/         pure game logic (win/draw detection) – no Angular, trivially testable
├── store/        TournamentStore: RxJS BehaviorSubject state + selectors + actions
└── components/
    ├── setup/       Reactive Form (FormBuilder) – names, X/O, number of games
    ├── game/        smart component: combines store selectors into one view-model stream
    ├── board/       dumb component (input/output)
    ├── scoreboard/  dumb component
    └── results/     final standings + "Play again"
```

- **State**: one immutable state object in a `BehaviorSubject`; components read it through
  `distinctUntilChanged` selectors and the `async` pipe, and change it only through store actions.
- **Forms**: `FormBuilder.nonNullable`, `Validators.required/minLength/maxLength`, a custom
  `notBlank` validator and a group-level `distinctNames` validator (case-insensitive).
- All components are standalone with `OnPush` change detection.

## Rules implemented

- Player 2 automatically gets the symbol Player 1 did not pick.
- All N games are played; the starting player alternates every game (Player 1 starts game 1).
- Wins and draws are tracked separately; the header shows "Game 3 of 5".
- Overall winner = most wins; equal wins is reported as a tie.

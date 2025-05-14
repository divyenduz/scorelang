# scorelang

A DSL to run Football tournaments.

# Build

```bash
bun run build
```

`scorelang` binary should be ready to use now.

# Usage

- Record the scores of the tournament in text form (save as `tournament.sl`). Separated by semi-colon;

```
TeamA 2-0 TeamB;
TeamA 3-0 TeamC;
TeamB 0-1 TeamC;
TeamA 0-0 TeamB;
TeamA 1-5 TeamC;
TeamB 0-1 TeamC;
TeamA 2-2 TeamB;
TeamA 4-0 TeamC;
TeamB 1-0 TeamC;
TeamA 0-2 TeamB;
TeamA 1-0 TeamC;
TeamB 0-1 TeamC;
TeamA 1-4 TeamB;
TeamA 1-3 TeamC;
TeamB 3-1 TeamC;
TeamA 0-3 TeamB;
TeamA 0-2 TeamC;
TeamB 1-1 TeamC;
```

- pipe it into the scorelang binary

```bash
cat tournaments.sl | ./scorelang
```

or execute the file

```bash
./scorelang src/tournament.sl
```

- It prints the points table

```
./scorelang src/tournament.sl                                                         20:01:32
┌───────┬──────┬────────┬───────┬────────┐
│ Team  │ Wins │ Losses │ Draws │ Points │
├───────┼──────┼────────┼───────┼────────┤
│ TeamC │ 6    │ 5      │ 1     │ 19     │
├───────┼──────┼────────┼───────┼────────┤
│ TeamB │ 5    │ 4      │ 3     │ 18     │
├───────┼──────┼────────┼───────┼────────┤
│ TeamA │ 4    │ 6      │ 2     │ 14     │
└───────┴──────┴────────┴───────┴────────┘
```
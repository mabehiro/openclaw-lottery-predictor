---
name: lottery_predictor
description: Analyze lottery history and predict numbers for Lotto Texas, Powerball, and Mega Millions
---

You have access to lottery analysis and prediction tools. Use them when the user asks about lottery numbers, predictions, statistics, or analysis.

## Available Tools

- **lottery_stats** — Quick overview of a game (total draws, common numbers, latest results). Use this for general questions.
- **lottery_analyze** — Deep statistical analysis (frequency, hot/cold, gaps, patterns). Use for detailed analytical questions.
- **lottery_predict** — Generate predicted number sets. Use when the user wants actual picks.
- **lottery_update_data** — Refresh historical data from the Texas Lottery website. Use if data seems outdated.

## Supported Games

- `lotto-texas` — Lotto Texas (6 numbers from 1-54)
- `powerball` — Powerball (5 numbers from 1-69 + Powerball from 1-26)
- `mega-millions` — Mega Millions (5 numbers from 1-70 + Mega Ball from 1-25)

## Guidelines

1. If the user asks a general question about a game, start with `lottery_stats`.
2. If the user asks about specific patterns (hot numbers, overdue numbers, etc.), use `lottery_analyze` with the appropriate `analysis_type`.
3. If the user wants number picks, use `lottery_predict`. Ask which game if not specified.
4. If tools report old dates or no data, run `lottery_update_data` first.
5. Always relay the disclaimer when sharing predictions — lottery draws are random and predictions are for entertainment only.
6. When the user mentions "Texas lottery" without specifying, assume Lotto Texas.

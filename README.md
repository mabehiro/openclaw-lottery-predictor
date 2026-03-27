# OpenClaw Lottery Predictor Plugin

An OpenClaw plugin that analyzes historical lottery data and generates number predictions for **Lotto Texas**, **Powerball**, and **Mega Millions**.

> Lottery drawings are random events. Predictions are based on historical pattern analysis and are for **entertainment purposes only**.

## Supported Games

| Game | Main Numbers | Bonus | Draw Days |
|------|-------------|-------|-----------|
| Lotto Texas | 6 from 1-54 | — | Mon / Wed / Sat |
| Powerball | 5 from 1-69 | 1 from 1-26 | Mon / Wed / Sat |
| Mega Millions | 5 from 1-70 | 1 from 1-25 | Tue / Fri |

Data is sourced from the [Texas Lottery](https://www.texaslottery.com) official CSV downloads. No API keys required.

## Requirements

- Node.js >= 22.14.0
- pnpm
- OpenClaw >= 2026.3.26

## Installation

### Option A: Install from local path

```bash
# 1. Copy the plugin folder to your OpenClaw machine

# 2. Install dependencies
cd openclaw-lottery-predictor
pnpm install

# 3. Run tests (optional)
pnpm test

# 4. Install the plugin
openclaw plugins install /path/to/openclaw-lottery-predictor

# 5. Restart the gateway
openclaw gateway restart
```

### Option B: Install from tarball

```bash
# 1. On the source machine, create the tarball
cd openclaw-lottery-predictor
pnpm install
pnpm pack

# 2. Copy the .tgz file to your OpenClaw machine

# 3. Install the plugin
openclaw plugins install ./openclaw-lottery-predictor-1.0.0.tgz

# 4. Restart the gateway
openclaw gateway restart
```

### Option C: Install from git

```bash
# 1. Clone the repository on your OpenClaw machine
git clone https://github.com/YOUR_USERNAME/openclaw-lottery-predictor.git

# 2. Install dependencies
cd openclaw-lottery-predictor
pnpm install

# 3. Install the plugin
openclaw plugins install ./openclaw-lottery-predictor

# 4. Restart the gateway
openclaw gateway restart
```

## Verify Installation

```bash
# Check that the plugin is loaded
openclaw plugins list
```

You should see `lottery-predictor` in the list.

## Usage

Once installed, the plugin registers 4 agent tools. Use them through any connected channel (Slack, Discord, Telegram, etc.).

### Quick Stats

> "What are the stats for Powerball?"

Returns total draws, date range, most/least common numbers, and latest draw results.

### Analyze Numbers

> "Analyze hot and cold numbers for Mega Millions"

> "Show me the overdue numbers for Lotto Texas from the last 100 draws"

Supports analysis types: `frequency`, `hot-cold`, `gaps`, `patterns`, or `all`.

### Get Predictions

> "Give me 5 sets of Lotto Texas predictions"

> "Predict Powerball numbers using the overdue-focus strategy"

Strategies: `balanced`, `overdue-focus`, `hot-streak`, `random-weighted`.

### Update Data

> "Update the lottery data"

Fetches the latest historical data from the Texas Lottery website.

## Configuration

Optional settings in your OpenClaw plugin config:

```json
{
  "plugins": {
    "entries": {
      "lottery-predictor": {
        "config": {
          "dataDir": "/custom/path/to/data",
          "autoRefreshEnabled": true
        }
      }
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dataDir` | string | `<plugin>/data/` | Custom directory for storing CSV data |
| `autoRefreshEnabled` | boolean | `true` | Enable automatic data refresh every 6 hours |

## How It Works

The plugin uses four statistical analysis engines:

1. **Frequency Analysis** — Counts how often each number appears across historical draws
2. **Hot/Cold Analysis** — Identifies numbers appearing significantly above or below average (using standard deviation)
3. **Gap/Overdue Analysis** — Tracks how long since each number last appeared vs. its historical average gap
4. **Pattern Analysis** — Detects frequently co-occurring number pairs and positional frequency patterns

The prediction engine combines these signals using weighted scoring:

| Signal | Balanced | Overdue Focus | Hot Streak |
|--------|----------|---------------|------------|
| Frequency | 0.25 | 0.10 | 0.35 |
| Hot/Cold | 0.20 | 0.10 | 0.35 |
| Gap/Overdue | 0.30 | 0.60 | 0.10 |
| Pair Affinity | 0.25 | 0.20 | 0.20 |

## Project Structure

```
openclaw-lottery-predictor/
├── package.json
├── tsconfig.json
├── openclaw.plugin.json
├── index.ts                      # Plugin entry point
├── data/                         # Historical CSV data (auto-populated)
├── lib/
│   ├── types.ts                  # Shared types
│   ├── game-configs.ts           # Game definitions and CSV parsers
│   ├── data-fetcher.ts           # Fetch and parse CSVs
│   ├── data-store.ts             # Local file storage and caching
│   ├── frequency-analysis.ts     # Frequency analysis engine
│   ├── hot-cold-analysis.ts      # Hot/cold number detection
│   ├── gap-analysis.ts           # Gap/overdue analysis
│   ├── pattern-analysis.ts       # Pair and positional patterns
│   ├── prediction-engine.ts      # Weighted scoring predictions
│   ├── formatter.ts              # Markdown output formatting
│   └── auto-refresh-service.ts   # Background data refresh service
├── tools/
│   ├── lottery-stats.ts          # lottery_stats tool
│   ├── analyze-lottery.ts        # lottery_analyze tool
│   ├── predict-numbers.ts        # lottery_predict tool
│   └── update-data.ts            # lottery_update_data tool
├── skills/
│   └── lottery-predictor/
│       └── SKILL.md              # Agent skill instructions
└── tests/                        # Unit tests (vitest)
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build
pnpm build
```

## License

MIT

# Hoofs Terminal

A trading-terminal style workspace for managing racing selections, staking, and P&L.

---

## Core Idea

This is NOT just another tips UI.

This is a **decision terminal**:
- fast input
- clear exposure
- live position awareness
- simple execution workflow

Think: **Betfair terminal + spreadsheet + Hoofs model outputs**.

---

## Version 1 Goals (MVP)

### UI
- dark trading terminal theme
- table-based race entry system
- compact, information-dense layout

### User Actions
- add/remove selections
- enter:
  - race
  - horse
  - stake
  - win odds
  - place odds (optional)
  - minimum acceptable odds (optional)

### Calculations
- total stake
- average odds
- projected return
- open exposure
- running P&L

### Position Tracking
- original bankroll
- current bankroll
- remaining stake capacity
- open vs settled bets

### Persistence
- localStorage (no backend required)

---

## UI Layout (Terminal Style)

### Top Bar
- bankroll
- total exposure
- current P&L
- number of active bets

### Main Grid
| Race | Horse | Stake | Win Odds | Place Odds | Min Odds | Status | Actions |

### Right Panel
- Position summary
- Exposure breakdown
- Profit / Loss projection

### Bottom Panel
- activity log
- settled bets

---

## Project Structure

```
hoofs-terminal/
  index.html
  styles/
    main.css
  scripts/
    app.js
    state.js
    calculations.js
    ui.js
```

---

## Tech Stack (Deliberate Choice)

Keep it SIMPLE:
- HTML
- CSS
- Vanilla JS

Why?
- deploy instantly (GitHub Pages)
- Codex-friendly
- no build step

Upgrade later if needed.

---

## Roadmap

### Phase 1
- terminal UI
- manual entry system
- core calculations
- persistence

### Phase 2
- CSV import (huge for you)
- strategy presets
- multi-race grouping
- placepot / exotic logic

### Phase 3
- model integration (Hoofs outputs)
- automated bet suggestions
- performance analytics

---

## Key Differentiator

Most tools:
- track bets AFTER placing

This tool:
- helps you manage **decisions BEFORE placing**

That’s where the edge is.

---

## Next Step

We now build:
1. index.html shell
2. terminal CSS
3. selection table logic
4. calculation engine

Then layer features on top.

---

If you’re using Codex:
→ feed it this README and ask it to generate Phase 1 in one shot.

# Vanilla JavaScript Blackjack Game

A feature-rich, interactive web-based Blackjack (21) game built using pure HTML5, CSS3, and modern ES6 JavaScript Modules. The application offers a full casino-style Blackjack experience featuring realistic game rules, interactive drag-and-drop mechanics, betting/bankroll tracking, split hands, double downs, surrenders, keyboard navigation, and responsive glassmorphism UI design.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Running Locally](#setup--running-locally)
- [Game Rules & Gameplay Features](#game-rules--gameplay-features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [File Summary](#file-summary)
- [Configuration](#configuration)

---

## Features

- **Full Blackjack Ruleset**: Supports standard Hit, Stand, Double Down, Split, and Surrender actions.
- **Interactive Drag-and-Drop Gameplay**: Hit by dragging a card from the deck directly onto the player's hand area.
- **Dynamic Hand & Score Calculation**: Automatic score calculation for both player and dealer, including dynamic Ace value adjustment ($11$ or $1$).
- **Bankroll & Betting Engine**: Place bets, track history of recent rounds, update win/loss tallies, and unlock gameplay upon placing a valid wager.
- **Split Hand Logic**: Split pairs into two separate hands with individual play and score evaluations.
- **Asynchronous Dealer AI**: Dealer draws cards sequentially with timed delay animations until reaching a score of at least 17.
- **User Navigation & Session Storage**: Usernames persist across pages via `localStorage`.
- **Keyboard Navigation**: Quick key shortcuts for navigating between pages.
- **Glassmorphism UI**: High-end visual style built with modern CSS custom backdrops.

---

## Project Structure

```text
├── index.html            # Landing / Login page
├── instruction.html      # Game rules and instructions page
├── leaderboard.html      # High score table
├── player.html           # Main Blackjack game board
├── style.css             # Main stylesheet (Glassmorphism & Layouts)
├── image/                # Game assets (Background, logos, card back)
│   ├── background1.jpg
│   ├── blackjacklogo.png
│   ├── card_back.png
│   ├── club/             # Card images by suit
│   ├── diamond/
│   ├── heart/
│   └── spade/
└── scripts/
    ├── config.json       # Game configuration, default bankroll & assets
    ├── home.js           # Home page logic & initial game join trigger
    ├── navigation.js     # Routing & keyboard shortcut navigation
    ├── utils.js          # Helper functions (Username handling)
    └── player/           # Core game engines
        ├── card.js       # Card class definition & rendering
        ├── deck.js       # Deck building & Fisher-Yates shuffle
        ├── game-logic.js # Central Blackjack game rules & state logic
        ├── game-state.js # Persistent session game state variables
        └── main.js       # UI interactions, drag-and-drop & event listeners
```

---

## Setup & Running Locally

Because this application utilizes native **ES6 JavaScript Modules** (`import` / `export`) and fetches local JSON configuration files (`config.json`), running `index.html` directly via the `file://` protocol will trigger browser CORS restrictions.

### Prerequisites
A basic HTTP web server environment is required to serve the files locally. Options include:

1. **VS Code Live Server extension**:
   - Open the project folder in Visual Studio Code.
   - Right-click `index.html` and select **Open with Live Server**.

2. **Python HTTP Server**:
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

3. **Node.js `http-server`**:
   ```bash
   npx http-server .
   ```

---

## Game Rules & Gameplay Features

1. **Objective**: Get a hand total as close to 21 as possible without exceeding it ("busting"), while having a total higher than the dealer's.
2. **Betting Stage**:
   - Every round requires a bet to unlock the game table controls.
   - Initial default bankroll is set to $1000 (configurable via `config.json`).
3. **Card Values**:
   - Number cards (2–10): Face value.
   - Face cards (J, Q, K): Value of 10.
   - Aces (A): Value of 11, automatically reduced to 1 if the total hand exceeds 21.
4. **Special Actions**:
   - **Hit**: Drag a card from the deck area into your player card hand zone.
   - **Stand**: Hold current total and end turn.
   - **Double Down**: Double the initial bet amount, draw exactly one card, and pass turn to dealer.
   - **Split**: If your initial two cards match in value, split them into two independent hands.
   - **Surrender**: Forfeit half the current bet and end the round immediately on the first turn.
5. **Dealer Rules**:
   - The dealer reveals their hidden card after the player completes their turn.
   - The dealer must hit until their total score reaches 17 or higher.

---

## Keyboard Shortcuts

The menu pages (`index.html`, `instruction.html`, `leaderboard.html`) support quick keyboard shortcuts:

| Key | Action |
| --- | --- |
| **Enter** | Join Game / Submit Name |
| **Escape** | Navigate to Home (`index.html`) |
| **`i`** | Navigate to Instructions (`instruction.html`) |
| **`l`** | Navigate to Leaderboard (`leaderboard.html`) |

---

## File Summary

- **`scripts/player/card.js`**: `Card` class representing individual card objects, constructing image paths, and generating DOM elements.
- **`scripts/player/deck.js`**: `Deck` class that asynchronously fetches card configuration, populates 52 cards, implements a Fisher-Yates shuffle, and deals cards.
- **`scripts/player/game-logic.js`**: Core state engine evaluating Blackjack rules, payouts, split mode transitions, and dealer execution.
- **`scripts/player/game-state.js`**: Holds persistent state across rounds (bankroll, wins, losses, bet amounts, and recent round histories).
- **`scripts/player/main.js`**: Connects DOM interactions, drag-and-drop HTML5 event handlers, dynamic score rendering, and async sleep animations.
- **`scripts/config.json`**: Dynamic JSON file defining starting bankrolls, asset paths, card values, suits, and leaderboard defaults.

---

## Configuration

Custom game values can be updated by editing `scripts/config.json`:

```json
{
  "initialState": {
    "defaultBankroll": 1000,
    "minNameLength": 2,
    "defaultUsername": "Anonymous"
  },
  "assets": {
    "cardBack": "image/card_back.png"
  }
}
```

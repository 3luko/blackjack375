// game-state.js

export const gameState = {
  playerMoney: 1000,
  currentBet: 0,
  winCount: 0,
  lossCount: 0,
  gameHistory: [],
  lastResult: "Place a bet to deal.",
  delayDealerReveal: false,
};

export function resetRoundState(game) {
  game.playerHands = [[]];
  game.currentHandIndex = 0;
  game.dealerHand = [];
  game.isRoundOver = true;
  game.splitMode = false;
  game.roundResults = [];
}

import { resetRoundState } from "./game-state.js";

/**
 * Pause execution for simple round animations.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load the initial bankroll from configuration with a safe fallback.
 *
 * @param {object} state - Shared game state.
 * @param {Function} updateBettingDisplay - Callback to refresh the betting UI.
 * @returns {Promise<void>}
 */
export async function loadInitialBalance(state, updateBettingDisplay) {
    try {
        const response = await fetch("./scripts/config.json");
        if (!response.ok) throw new Error("Failed to load config.json");

        const data = await response.json();
        state.playerMoney = data.initialState.defaultBankroll || 1000;
    } catch (error) {
        console.error("Error loading initial balance:", error);
        state.playerMoney = 1000;
    }

    updateBettingDisplay();
}

/**
 * Reset the table back to the pre-bet state.
 *
 * @param {object} options - Reset dependencies.
 * @param {object} options.state - Shared game state.
 * @param {object} options.game - Active game instance.
 * @param {Function} options.setGameplayActive - Toggle gameplay availability.
 * @param {Function} options.showHands - Refresh the card display.
 * @param {Function} options.updateButtons - Refresh action button states.
 * @param {Function} options.updateBettingDisplay - Refresh bankroll/bet UI.
 * @returns {void}
 */
export function setWaitingForBetState({
    state,
    game,
    setGameplayActive,
    showHands,
    updateButtons,
    updateBettingDisplay,
    message = "Place a bet to deal."
}) {
    state.delayDealerReveal = false;
    state.currentBet = 0;
    state.lastResult = message;
    game.statusMessage = message;
    resetRoundState(game);

    setGameplayActive(false);
    showHands();
    updateButtons();
    updateBettingDisplay();
}

/**
 * Settle the current round and persist the summary into shared state.
 *
 * @param {object} options - Settlement dependencies.
 * @param {object} options.state - Shared game state.
 * @param {object} options.game - Active game instance.
 * @param {Function} options.updateWinLossDisplay - Refresh win/loss counters.
 * @param {Function} options.updateBettingDisplay - Refresh bankroll/bet UI.
 * @param {Function} options.updateButtons - Refresh action button states.
 * @returns {void}
 */
export function finalizeRound({
    state,
    game,
    updateWinLossDisplay,
    updateBettingDisplay,
    updateButtons
}) {
    if (!game.isRoundOver || state.currentBet <= 0) return;

    const result = game.getRoundResult() || "loss";
    const settledBet = state.currentBet;

    if (result === "win") {
        state.playerMoney += settledBet * 2;
        state.winCount++;
        state.lastResult = `Win! Paid $${settledBet * 2}.`;
    } else if (result === "tie") {
        state.playerMoney += settledBet;
        state.lastResult = `Tie. Returned $${settledBet}.`;
    } else {
        state.lossCount++;
        state.lastResult = `Loss. Lost $${settledBet}.`;
    }

    state.gameHistory.push({
        result,
        bet: settledBet,
        total: state.playerMoney
    });

    state.currentBet = 0;
    updateWinLossDisplay();
    updateBettingDisplay();
    updateButtons();
}

/**
 * Validate the bet, start a new round, and perform the initial deal.
 *
 * @param {object} options - Round-start dependencies.
 * @param {object} options.state - Shared game state.
 * @param {object} options.game - Active game instance.
 * @param {HTMLInputElement} options.betInput - Bet input field.
 * @param {HTMLImageElement} options.hitDeck - Draggable deck image.
 * @param {Function} options.setGameplayActive - Toggle gameplay availability.
 * @param {Function} options.updateBettingDisplay - Refresh bankroll/bet UI.
 * @param {Function} options.updateButtons - Refresh action button states.
 * @param {Function} options.setActionButtonsDisabled - Toggle action inputs during animations.
 * @param {Function} options.showHands - Refresh the card display.
 * @param {Function} options.finalizeRound - Settle the round when needed.
 * @returns {Promise<void>}
 */
export async function startRoundFromBet({
    state,
    game,
    betInput,
    hitDeck,
    setGameplayActive,
    updateBettingDisplay,
    updateButtons,
    setActionButtonsDisabled,
    showHands,
    finalizeRound
}) {
    const betAmount = Number.parseInt(betInput.value, 10);

    if (!Number.isInteger(betAmount) || betAmount <= 0) {
        alert("Enter a bet greater than 0.");
        return;
    }

    if (betAmount > state.playerMoney) {
        alert("Your bet cannot be more than your available money.");
        return;
    }

    state.currentBet = betAmount;
    state.playerMoney -= betAmount;
    state.lastResult = `Bet placed: $${betAmount}`;

    setGameplayActive(true);
    updateBettingDisplay();
    updateButtons();
    setActionButtonsDisabled(true);

    await game.startGame();

    if (hitDeck && game.deck.cardBackPath) {
        hitDeck.src = game.deck.cardBackPath;
    }

    showHands();

    if (game.isRoundOver) {
        finalizeRound();
        return;
    }

    setActionButtonsDisabled(false);
    updateButtons();
}

/**
 * Run the dealer's drawing sequence until the house rules are satisfied.
 *
 * @param {object} options - Dealer-turn dependencies.
 * @param {object} options.game - Active game instance.
 * @param {Function} options.showHands - Refresh the card display.
 * @param {Function} options.finalizeRound - Settle the round after dealer play.
 * @param {Function} options.updateButtons - Refresh action button states.
 * @returns {Promise<void>}
 */
export async function runDealerTurn({
    game,
    showHands,
    finalizeRound,
    updateButtons
}) {
    game.statusMessage = "Dealer's turn.";
    showHands();
    await sleep(1000);

    while (game.getDealerScore() < 17) {
        game.statusMessage = "Dealer draws a card...";
        showHands();
        await sleep(1000);

        game.dealerDrawCard();
        showHands();
        await sleep(1000);
    }

    game.finishDealerTurn();
    showHands();
    finalizeRound();
    updateButtons();
}

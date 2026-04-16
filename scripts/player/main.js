import Game from "./game-logic.js";
import { gameState } from "./game-state.js";
import {
    setActionButtonsDisabled,
    setGameplayActive,
    showHands,
    updateBettingDisplay,
    updateButtons,
    updateWinLossDisplay
} from "./ui.js";
import {
    finalizeRound,
    loadInitialBalance,
    runDealerTurn,
    setWaitingForBetState,
    sleep,
    startRoundFromBet
} from "./round-manager.js";
import { updateUsername } from "../utils.js";
import { initHomeButton } from "../navigation.js";

const game = new Game(updateUsername());

const layout = document.getElementById("layout");
const gameArea = document.getElementById("game");
const controls = document.getElementById("controls");
const hitDeck = document.getElementById("hitDeck");
const playerCardsDiv = document.getElementById("playerCards");
const dealerCardsDiv = document.getElementById("dealerCards");
const standBtn = document.getElementById("stand");
const betBtn = document.getElementById("bet-btn");
const betInput = document.getElementById("bet-input");
const restartBtn = document.getElementById("restart");
const doubleBtn = document.getElementById("double");
const splitBtn = document.getElementById("split");
const surrenderBtn = document.getElementById("surrender");
const balanceDisplay = document.querySelector("#balance");
const currentBetDisplay = document.querySelector("#currentBet");
const lastResultDisplay = document.querySelector("#lastResult");
const historyList = document.querySelector("#historyList");
const winDisplay = document.querySelector("#win");
const lossDisplay = document.querySelector("#loss");
const playerScore = document.getElementById("playerScore");
const dealerScore = document.getElementById("dealerScore");
const gameStatus = document.getElementById("gameStatus");

const bettingElements = {
    balanceDisplay,
    currentBetDisplay,
    lastResultDisplay,
    historyList
};

const counterElements = {
    winDisplay,
    lossDisplay
};

const layoutElements = {
    layout,
    gameArea,
    controls
};

const actionElements = {
    hitDeck,
    standBtn,
    doubleBtn,
    splitBtn,
    surrenderBtn
};

const buttonElements = {
    ...actionElements,
    restartBtn,
    betBtn,
    betInput
};

const boardElements = {
    playerCardsDiv,
    dealerCardsDiv,
    playerScore,
    dealerScore,
    gameStatus
};

const refreshBettingDisplay = () => updateBettingDisplay(gameState, bettingElements);
const refreshWinLossDisplay = () => updateWinLossDisplay(gameState, counterElements);
const toggleGameplayActive = (isActive) => setGameplayActive(isActive, layoutElements);
const toggleActionButtonsDisabled = (disabled) => setActionButtonsDisabled(disabled, actionElements);
const refreshButtons = () => updateButtons(gameState, game, buttonElements);
const renderHands = () => showHands(game, gameState, boardElements);

const settleRound = () => finalizeRound({
    state: gameState,
    game,
    updateWinLossDisplay: refreshWinLossDisplay,
    updateBettingDisplay: refreshBettingDisplay,
    updateButtons: refreshButtons
});

const resetTable = () => setWaitingForBetState({
    state: gameState,
    game,
    setGameplayActive: toggleGameplayActive,
    showHands: renderHands,
    updateButtons: refreshButtons,
    updateBettingDisplay: refreshBettingDisplay
});

betBtn.addEventListener("click", async () => {
    if (gameState.currentBet > 0 && !game.isRoundOver) return;

    await startRoundFromBet({
        state: gameState,
        game,
        betInput,
        hitDeck,
        setGameplayActive: toggleGameplayActive,
        updateBettingDisplay: refreshBettingDisplay,
        updateButtons: refreshButtons,
        setActionButtonsDisabled: toggleActionButtonsDisabled,
        showHands: renderHands,
        finalizeRound: settleRound
    });
});

hitDeck.addEventListener("dragstart", (event) => {
    if (game.isRoundOver || standBtn.disabled) {
        event.preventDefault();
        return;
    }

    event.dataTransfer.setData("text/plain", "hit-card");
});

playerCardsDiv.addEventListener("dragover", (event) => {
    if (game.isRoundOver || standBtn.disabled) return;

    event.preventDefault();
    playerCardsDiv.classList.add("drag-over");
});

playerCardsDiv.addEventListener("dragleave", () => {
    playerCardsDiv.classList.remove("drag-over");
});

playerCardsDiv.addEventListener("drop", async (event) => {
    event.preventDefault();
    playerCardsDiv.classList.remove("drag-over");

    if (game.isRoundOver || standBtn.disabled) return;

    const draggedItem = event.dataTransfer.getData("text/plain");
    if (draggedItem !== "hit-card") return;

    toggleActionButtonsDisabled(true);
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} draws a card...`;
    renderHands();
    await sleep(700);

    game.hit();
    renderHands();
    await sleep(700);

    if (game.isCurrentHandBust()) {
        if (game.moveToNextHand()) {
            game.statusMessage = "Hand 1 busts. Playing hand 2.";
            renderHands();
            await sleep(900);
            toggleActionButtonsDisabled(false);
            refreshButtons();
            return;
        }

        if (game.hasActiveHand()) {
            await runDealerTurn({
                game,
                showHands: renderHands,
                finalizeRound: settleRound,
                updateButtons: refreshButtons
            });
            toggleActionButtonsDisabled(false);
            refreshButtons();
            return;
        }

        gameState.delayDealerReveal = true;
        renderHands();
        await sleep(900);
        gameState.delayDealerReveal = false;

        game.finishPlayerBustRound();
        renderHands();
        settleRound();
        refreshButtons();
        return;
    }

    toggleActionButtonsDisabled(false);
    refreshButtons();
});

standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    toggleActionButtonsDisabled(true);

    game.statusMessage = game.splitMode
        ? `Hand ${game.currentHandIndex + 1} stands.`
        : `${game.username} stands.`;

    renderHands();
    await sleep(800);

    if (game.moveToNextHand()) {
        game.statusMessage = "Playing hand 2.";
        renderHands();
        await sleep(800);
        toggleActionButtonsDisabled(false);
        refreshButtons();
        return;
    }

    await runDealerTurn({
        game,
        showHands: renderHands,
        finalizeRound: settleRound,
        updateButtons: refreshButtons
    });
    toggleActionButtonsDisabled(false);
    refreshButtons();
});

doubleBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canDouble()) return;

    toggleActionButtonsDisabled(true);
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} doubles.`;
    renderHands();
    await sleep(700);

    game.doubleCurrentHand();
    renderHands();
    await sleep(900);

    if (game.isCurrentHandBust()) {
        if (game.moveToNextHand()) {
            game.statusMessage = "Current hand busts. Playing next hand.";
            renderHands();
            await sleep(800);
            toggleActionButtonsDisabled(false);
            refreshButtons();
            return;
        }

        gameState.delayDealerReveal = true;
        renderHands();
        await sleep(900);
        gameState.delayDealerReveal = false;

        game.finishPlayerBustRound();
        renderHands();
        settleRound();
        refreshButtons();
        return;
    }

    if (game.moveToNextHand()) {
        game.statusMessage = "Double complete. Playing hand 2.";
        renderHands();
        await sleep(800);
        toggleActionButtonsDisabled(false);
        refreshButtons();
        return;
    }

    await runDealerTurn({
        game,
        showHands: renderHands,
        finalizeRound: settleRound,
        updateButtons: refreshButtons
    });
    toggleActionButtonsDisabled(false);
    refreshButtons();
});

splitBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSplit()) {
        alert("You can only split when your first two cards have the same value.");
        return;
    }

    toggleActionButtonsDisabled(true);
    game.statusMessage = "Splitting hand...";
    renderHands();
    await sleep(800);

    game.splitHand();
    renderHands();
    await sleep(800);

    game.statusMessage = "Playing hand 1";
    renderHands();
    await sleep(800);

    toggleActionButtonsDisabled(false);
    refreshButtons();
});

restartBtn.addEventListener("click", async () => {
    toggleActionButtonsDisabled(true);
    await sleep(200);
    setWaitingForBetState({
        state: gameState,
        game,
        setGameplayActive: toggleGameplayActive,
        showHands: renderHands,
        updateButtons: refreshButtons,
        updateBettingDisplay: refreshBettingDisplay,
        message: "Round reset. Place a bet to deal again."
    });
});

surrenderBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSurrender()) return;

    toggleActionButtonsDisabled(true);
    game.statusMessage = `${game.username} chooses to surrender...`;
    renderHands();
    await sleep(800);

    game.surrender();
    renderHands();
    settleRound();
    refreshButtons();
});

initHomeButton();
refreshWinLossDisplay();
resetTable();
loadInitialBalance(gameState, refreshBettingDisplay);

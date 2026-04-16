/**
 * Format a number for display in the betting panel.
 *
 * @param {number} amount - Numeric amount to display.
 * @returns {string} Display-ready currency text.
 */
export function formatCurrency(amount) {
    return amount.toString();
}

/**
 * Render the recent round results list.
 *
 * @param {HTMLElement | null} historyList - Target list element.
 * @param {Array<{result: string, bet: number, total: number}>} gameHistory - Stored round history.
 * @returns {void}
 */
export function updateHistoryList(historyList, gameHistory) {
    if (!historyList) return;

    historyList.innerHTML = "";

    gameHistory
        .slice(-3)
        .reverse()
        .forEach((entry) => {
            const item = document.createElement("li");
            item.textContent = `${entry.result.toUpperCase()} | Bet: $${entry.bet} | Total: $${entry.total}`;
            historyList.appendChild(item);
        });
}

/**
 * Refresh the bankroll, bet, result, and history display.
 *
 * @param {object} state - Shared game state.
 * @param {object} elements - UI elements used by the betting panel.
 * @param {HTMLElement} elements.balanceDisplay - Balance output.
 * @param {HTMLElement} elements.currentBetDisplay - Current bet output.
 * @param {HTMLElement} elements.lastResultDisplay - Last result output.
 * @param {HTMLElement | null} elements.historyList - Recent history list.
 * @returns {void}
 */
export function updateBettingDisplay(state, elements) {
    elements.balanceDisplay.textContent = formatCurrency(state.playerMoney);
    elements.currentBetDisplay.textContent = formatCurrency(state.currentBet);
    elements.lastResultDisplay.textContent = state.lastResult;
    updateHistoryList(elements.historyList, state.gameHistory);
}

/**
 * Refresh the win and loss counters.
 *
 * @param {object} state - Shared game state.
 * @param {object} elements - Counter display elements.
 * @param {HTMLElement} elements.winDisplay - Win count output.
 * @param {HTMLElement} elements.lossDisplay - Loss count output.
 * @returns {void}
 */
export function updateWinLossDisplay(state, elements) {
    elements.winDisplay.textContent = state.winCount;
    elements.lossDisplay.textContent = state.lossCount;
}

/**
 * Toggle the visual disabled state for the gameplay area until a bet is placed.
 *
 * @param {boolean} isActive - Whether the round is currently active.
 * @param {object} elements - Layout elements that change state.
 * @param {HTMLElement} elements.layout - Top-level layout container.
 * @param {HTMLElement} elements.gameArea - Main game area.
 * @param {HTMLElement} elements.controls - Action controls container.
 * @returns {void}
 */
export function setGameplayActive(isActive, elements) {
    elements.layout.classList.toggle("awaiting-bet", !isActive);
    elements.gameArea.classList.toggle("gameplay-disabled", !isActive);
    elements.controls.classList.toggle("gameplay-disabled", !isActive);
}

/**
 * Disable or enable action buttons while animations are running.
 *
 * @param {boolean} disabled - Whether actions should be disabled.
 * @param {object} elements - Interactive gameplay controls.
 * @param {HTMLImageElement} elements.hitDeck - Draggable deck image.
 * @param {HTMLButtonElement} elements.standBtn - Stand button.
 * @param {HTMLButtonElement} elements.doubleBtn - Double button.
 * @param {HTMLButtonElement} elements.splitBtn - Split button.
 * @param {HTMLButtonElement} elements.surrenderBtn - Surrender button.
 * @returns {void}
 */
export function setActionButtonsDisabled(disabled, elements) {
    elements.hitDeck.draggable = !disabled;
    elements.hitDeck.style.opacity = disabled ? "0.5" : "1";
    elements.standBtn.disabled = disabled;
    elements.doubleBtn.disabled = disabled;
    elements.splitBtn.disabled = disabled;
    elements.surrenderBtn.disabled = disabled;
}

/**
 * Update button availability based on the current round state.
 *
 * @param {object} state - Shared game state.
 * @param {object} game - Active game instance.
 * @param {object} elements - Gameplay controls and bet inputs.
 * @param {HTMLImageElement} elements.hitDeck - Draggable deck image.
 * @param {HTMLButtonElement} elements.standBtn - Stand button.
 * @param {HTMLButtonElement} elements.restartBtn - Restart button.
 * @param {HTMLButtonElement} elements.doubleBtn - Double button.
 * @param {HTMLButtonElement} elements.splitBtn - Split button.
 * @param {HTMLButtonElement} elements.surrenderBtn - Surrender button.
 * @param {HTMLButtonElement} elements.betBtn - Bet button.
 * @param {HTMLInputElement} elements.betInput - Bet input.
 * @returns {void}
 */
export function updateButtons(state, game, elements) {
    const roundActive = state.currentBet > 0 && !game.isRoundOver;

    elements.hitDeck.draggable = roundActive;
    elements.hitDeck.style.opacity = roundActive ? "1" : "0.5";

    elements.standBtn.disabled = !roundActive;
    elements.restartBtn.disabled = roundActive;
    elements.doubleBtn.disabled = !roundActive || !game.canDouble();
    elements.splitBtn.disabled = !roundActive || !game.canSplit();
    elements.surrenderBtn.disabled = !roundActive || !game.canSurrender();
    elements.betBtn.disabled = roundActive;
    elements.betInput.disabled = roundActive;
}

/**
 * Render dealer cards, player hands, scores, and status text.
 *
 * @param {object} game - Active game instance.
 * @param {object} state - Shared game state.
 * @param {object} elements - Gameplay display elements.
 * @param {HTMLElement} elements.playerCardsDiv - Player card container.
 * @param {HTMLElement} elements.dealerCardsDiv - Dealer card container.
 * @param {HTMLElement} elements.playerScore - Player score output.
 * @param {HTMLElement} elements.dealerScore - Dealer score output.
 * @param {HTMLElement} elements.gameStatus - Round status output.
 * @returns {void}
 */
export function showHands(game, state, elements) {
    elements.playerCardsDiv.innerHTML = "";
    elements.dealerCardsDiv.innerHTML = "";

    game.playerHands.forEach((hand, index) => {
        const handWrapper = document.createElement("div");
        handWrapper.classList.add("hand-wrapper");

        if (game.splitMode && index === game.currentHandIndex && !game.isRoundOver) {
            handWrapper.classList.add("active-hand");
        }

        const handLabel = document.createElement("p");
        handLabel.textContent = game.splitMode ? `Hand ${index + 1} - Score: ${game.calculateScore(hand)}` : "";
        if (game.splitMode) {
            handWrapper.appendChild(handLabel);
        }

        const cardsRow = document.createElement("div");
        cardsRow.classList.add("split-hand-row");

        hand.forEach((card) => {
            const cardImgElement = card.render();
            cardImgElement.alt = `${card.name} of ${card.suit}`;
            cardsRow.appendChild(cardImgElement);
        });

        handWrapper.appendChild(cardsRow);
        elements.playerCardsDiv.appendChild(handWrapper);
    });

    game.dealerHand.forEach((card, index) => {
        let cardImgElement;

        if ((!game.isRoundOver || state.delayDealerReveal) && index === 1) {
            cardImgElement = document.createElement("img");
            cardImgElement.classList.add("card");
            cardImgElement.src = game.deck.cardBackPath;
            cardImgElement.alt = "Hidden card";
        } else {
            cardImgElement = card.render();
            cardImgElement.alt = `${card.name} of ${card.suit}`;
        }

        elements.dealerCardsDiv.appendChild(cardImgElement);
    });

    elements.playerScore.textContent = game.splitMode
        ? `Current hand score: ${game.getPlayerScore()}`
        : `Score: ${game.getPlayerScore()}`;

    elements.dealerScore.textContent = game.isRoundOver
        ? `Score: ${game.getDealerScore()}`
        : "Score: ?";

    elements.gameStatus.textContent = game.statusMessage;
}

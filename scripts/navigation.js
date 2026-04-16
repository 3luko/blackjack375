// navigation.js

// Home button logic
export function initHomeButton() {
    const homeBtn = document.getElementById("home");
    if (!homeBtn) return;

    homeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

// Instruction button logic
export function initInstructionButton() {
    const instructionBtn = document.getElementById("instruction");
    if (!instructionBtn) return;

    instructionBtn.addEventListener("click", () => {
        window.location.href = "instruction.html";
    });
}

// Join button logic
export function initJoinButton() {
    const joinBtn = document.getElementById("join");
    if (!joinBtn) return;

    joinBtn.addEventListener("click", () => {
        window.location.href = "player.html";
    });
}

// Leaderboard button logic
export function initLeaderboardButton() {
    const leaderboardBtn = document.getElementById("leaderboard");
    if (!leaderboardBtn) return;

    leaderboardBtn.addEventListener("click", () => {
        window.location.href = "leaderboard.html";
    });
}

// Keyboard shortcuts for navigation
export function initKeyboardNavigation() {
    window.addEventListener("keydown", event => {
        switch (event.key.toLowerCase()) {
            case "escape":
                window.location.href = "index.html";
                break;

            case "i":
                window.location.href = "instruction.html";
                break;

            case "l":
                window.location.href = "leaderboard.html";
                break;

            case "enter":
                window.location.href = "player.html";
                break;
        }
    });
}

// Initialize all navigation buttons
export function initNavigation() {
    initHomeButton();
    initInstructionButton();
    initJoinButton();
    initLeaderboardButton();
    initKeyboardNavigation();
}
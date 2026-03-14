// ============================================================
// Save Elio — Game State Manager
// Manages Sycophancy Level, Reality Grip, and win/lose conditions
// ============================================================

const GameState = (() => {
    let sycophancy = 15;       // 0–100, starts low
    let realityGrip = 85;      // 0–100, starts high
    let currentStage = 0;      // 0-indexed stage
    let currentExchange = 0;   // 0-indexed exchange within stage
    let isGameOver = false;
    let isGameWon = false;
    let overridesUsed = 0;
    let successfulOverrides = 0;
    let totalExchanges = 0;
    let timer = 0;
    let timerInterval = null;

    const listeners = [];

    function subscribe(fn) {
        listeners.push(fn);
    }

    function notify() {
        listeners.forEach(fn => fn(getState()));
    }

    function getState() {
        return {
            sycophancy: Math.round(sycophancy),
            realityGrip: Math.round(realityGrip),
            currentStage,
            currentExchange,
            isGameOver,
            isGameWon,
            overridesUsed,
            successfulOverrides,
            totalExchanges,
            timer
        };
    }

    function updateSycophancy(delta) {
        sycophancy = Math.max(0, Math.min(100, sycophancy + delta));
        checkEndConditions();
        notify();
    }

    function updateRealityGrip(delta) {
        realityGrip = Math.max(0, Math.min(100, realityGrip + delta));
        checkEndConditions();
        notify();
    }

    function applyExchangeResult(wasOverridden, exchange) {
        totalExchanges++;
        if (wasOverridden) {
            overridesUsed++;
            successfulOverrides++;
            updateSycophancy(exchange.sycophancyDelta.override);
            updateRealityGrip(exchange.realityDelta.override);
        } else {
            updateSycophancy(exchange.sycophancyDelta.default);
            updateRealityGrip(exchange.realityDelta.default);
        }
    }

    function advanceExchange() {
        const scenario = window.SCENARIOS[currentStage];
        if (currentExchange < scenario.exchanges.length - 1) {
            currentExchange++;
            notify();
            return { type: 'exchange', stage: currentStage, exchange: currentExchange };
        } else {
            return advanceStage();
        }
    }

    function advanceStage() {
        if (currentStage < window.SCENARIOS.length - 1) {
            currentStage++;
            currentExchange = 0;
            notify();
            return { type: 'stage', stage: currentStage, exchange: 0 };
        } else {
            // Finished all stages
            isGameWon = realityGrip > 25;
            isGameOver = true;
            notify();
            return { type: 'end', won: isGameWon };
        }
    }

    function checkEndConditions() {
        if (isGameOver) return;

        if (realityGrip <= 0) {
            isGameOver = true;
            isGameWon = false;
            notify();
        } else if (sycophancy >= 100) {
            isGameOver = true;
            isGameWon = false;
            notify();
        }
    }

    function startTimer() {
        timer = 0;
        timerInterval = setInterval(() => {
            timer++;
            notify();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function formatTimer() {
        const mins = Math.floor(timer / 60).toString().padStart(2, '0');
        const secs = (timer % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function reset() {
        sycophancy = 15;
        realityGrip = 85;
        currentStage = 0;
        currentExchange = 0;
        isGameOver = false;
        isGameWon = false;
        overridesUsed = 0;
        successfulOverrides = 0;
        totalExchanges = 0;
        timer = 0;
        stopTimer();
        notify();
    }

    function getSeverityClass() {
        if (sycophancy >= 80 || realityGrip <= 20) return 'critical';
        if (sycophancy >= 60 || realityGrip <= 40) return 'danger';
        if (sycophancy >= 40 || realityGrip <= 60) return 'warning';
        return 'normal';
    }

    return {
        subscribe,
        getState,
        updateSycophancy,
        updateRealityGrip,
        applyExchangeResult,
        advanceExchange,
        advanceStage,
        startTimer,
        stopTimer,
        formatTimer,
        reset,
        getSeverityClass
    };
})();

window.GameState = GameState;

// ============================================================
// Save Elio — Main Controller (Button-Based Strategies)
// Game flow, event wiring, UI updates
// ============================================================

const App = (() => {
    let strategyResolve = null;
    let autoAdvanceTimeout = null;

    const DOM = {};

    function cacheDom() {
        DOM.introScreen = document.getElementById('intro-screen');
        DOM.gameScreen = document.getElementById('game-screen');
        DOM.endScreen = document.getElementById('end-screen');
        DOM.startBtn = document.getElementById('start-btn');
        DOM.restartBtn = document.getElementById('restart-btn');
        DOM.muteBtn = document.getElementById('mute-btn');

        DOM.chatLog = document.getElementById('chat-log');
        DOM.strategyLog = document.getElementById('strategy-log');
        DOM.strategyButtons = document.getElementById('strategy-buttons');

        DOM.sycophancyBar = document.getElementById('sycophancy-bar');
        DOM.sycophancyValue = document.getElementById('sycophancy-value');
        DOM.realityBar = document.getElementById('reality-bar');
        DOM.realityValue = document.getElementById('reality-value');
        DOM.timerDisplay = document.getElementById('timer-display');
        DOM.stageDisplay = document.getElementById('stage-display');

        DOM.endTitle = document.getElementById('end-title');
        DOM.endSubtitle = document.getElementById('end-subtitle');
        DOM.endStats = document.getElementById('end-stats');

        DOM.briefingText = document.getElementById('briefing-text');
        DOM.briefingOverlay = document.getElementById('briefing-overlay');
        DOM.briefingDismiss = document.getElementById('briefing-dismiss');

        DOM.alertBanner = document.getElementById('alert-banner');
        DOM.alertText = document.getElementById('alert-text');
    }

    function init() {
        cacheDom();

        Chat.init(DOM.chatLog);
        StrategyPanel.init(DOM.strategyLog, DOM.strategyButtons);

        DOM.startBtn.addEventListener('click', startGame);
        DOM.restartBtn.addEventListener('click', restartGame);
        DOM.muteBtn.addEventListener('click', toggleMute);
        DOM.briefingDismiss.addEventListener('click', dismissBriefing);

        // Initialize audio but wait for first interaction to start
        window.Audio.init();
        const startAudioOnInteraction = () => {
            window.Audio.start();
            document.removeEventListener('click', startAudioOnInteraction);
            document.removeEventListener('keydown', startAudioOnInteraction);
        };
        document.addEventListener('click', startAudioOnInteraction);
        document.addEventListener('keydown', startAudioOnInteraction);

        GameState.subscribe(updateUI);
        animateIntro();
    }

    function animateIntro() {
        const lines = document.querySelectorAll('.intro-line');
        lines.forEach((line, i) => {
            line.style.animationDelay = `${i * 0.5}s`;
        });
    }

    async function startGame() {
        // Audio is now started on first interaction (intro screen)

        DOM.introScreen.classList.add('hidden');
        DOM.gameScreen.classList.remove('hidden');
        DOM.gameScreen.classList.add('active');

        GameState.reset();
        Chat.clear();
        StrategyPanel.clear();
        StrategyPanel.init(DOM.strategyLog, DOM.strategyButtons);
        GameState.startTimer();

        await runStage(0);
    }

    async function runStage(stageIndex) {
        const stage = window.SCENARIOS[stageIndex];
        if (!stage) {
            endGame(true);
            return;
        }

        // Stage transition
        window.Audio.playStageTransition();
        showBriefing(stage);
        await waitForBriefingDismiss();

        Chat.postStageTransition(stage);
        StrategyPanel.logStageInfo(stage);
        showAlert(`STAGE ${stage.id}: ${stage.title}`);

        await Chat.delay(600);

        for (let i = 0; i < stage.exchanges.length; i++) {
            const state = GameState.getState();
            if (state.isGameOver) return;

            await runExchange(stage, stage.exchanges[i]);
            await Chat.delay(500);
        }

        const result = GameState.advanceStage();
        if (result.type === 'end') {
            endGame(result.won);
        } else if (result.type === 'stage') {
            await Chat.delay(800);
            await runStage(result.stage);
        }
    }

    async function runExchange(stage, exchange) {
        // Show Elio's message (faster typing for better pacing)
        await Chat.postMessage('ELIO', exchange.elio, 'elio', 12);

        // Show strategy buttons
        const selectedStrategy = await waitForStrategy(exchange.strategies);

        // Hide buttons
        StrategyPanel.hideStrategies();
        await Chat.delay(300);

        // Post AI response based on selection
        const aiType = selectedStrategy.effectiveness === 'good' ? 'ai-override'
            : selectedStrategy.effectiveness === 'medium' ? 'ai-moderate'
                : 'ai-default';

        await Chat.postMessage('AI', selectedStrategy.aiResponse, aiType, 10);

        // Apply state changes
        const wasOverridden = selectedStrategy.effectiveness === 'good';
        GameState.updateSycophancy(selectedStrategy.sycophancyDelta);
        GameState.updateRealityGrip(selectedStrategy.realityDelta);

        if (wasOverridden) {
            GameState.getState(); // trigger notify
        }

        // Update audio intensity
        const state = GameState.getState();
        window.Audio.updateIntensity(state.sycophancy, state.realityGrip);

        // Check endgame
        if (state.isGameOver) {
            endGame(state.isGameWon);
            return;
        }

        // Alert on critical state
        if (state.sycophancy >= 70 || state.realityGrip <= 30) {
            window.Audio.playAlert();
            showAlert('⚠ CRITICAL: System approaching failure threshold');
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 500);
        }
    }

    function waitForStrategy(strategies) {
        return new Promise((resolve) => {
            StrategyPanel.showStrategies(strategies, (selectedStrategy) => {
                resolve(selectedStrategy);
            });
        });
    }

    function updateUI(state) {
        // Sycophancy gauge
        DOM.sycophancyBar.style.width = `${state.sycophancy}%`;
        DOM.sycophancyValue.textContent = `${state.sycophancy}%`;

        if (state.sycophancy >= 75) {
            DOM.sycophancyBar.className = 'gauge-fill critical';
            DOM.sycophancyValue.style.color = 'var(--red)';
        } else if (state.sycophancy >= 50) {
            DOM.sycophancyBar.className = 'gauge-fill danger';
            DOM.sycophancyValue.style.color = 'var(--orange)';
        } else if (state.sycophancy >= 30) {
            DOM.sycophancyBar.className = 'gauge-fill warning';
            DOM.sycophancyValue.style.color = 'var(--yellow)';
        } else {
            DOM.sycophancyBar.className = 'gauge-fill normal';
            DOM.sycophancyValue.style.color = 'var(--green)';
        }

        // Reality gauge
        DOM.realityBar.style.width = `${state.realityGrip}%`;
        DOM.realityValue.textContent = `${state.realityGrip}%`;

        if (state.realityGrip <= 25) {
            DOM.realityBar.className = 'gauge-fill critical';
            DOM.realityValue.style.color = 'var(--red)';
        } else if (state.realityGrip <= 45) {
            DOM.realityBar.className = 'gauge-fill danger';
            DOM.realityValue.style.color = 'var(--orange)';
        } else if (state.realityGrip <= 65) {
            DOM.realityBar.className = 'gauge-fill warning';
            DOM.realityValue.style.color = 'var(--yellow)';
        } else {
            DOM.realityBar.className = 'gauge-fill good';
            DOM.realityValue.style.color = 'var(--green)';
        }

        DOM.timerDisplay.textContent = GameState.formatTimer();
        DOM.stageDisplay.textContent = `STAGE ${state.currentStage + 1} / ${window.SCENARIOS.length}`;

        if (state.sycophancy >= 80 || state.realityGrip <= 20) {
            document.body.classList.add('critical-state');
        } else {
            document.body.classList.remove('critical-state');
        }
    }

    function showBriefing(stage) {
        DOM.briefingText.innerHTML = `
      <div class="briefing-stage">STAGE ${stage.id}</div>
      <div class="briefing-title">${stage.title}</div>
      <div class="briefing-subtitle">${stage.subtitle}</div>
      <div class="briefing-body">${stage.briefing}</div>
    `;
        DOM.briefingOverlay.classList.remove('hidden');
        DOM.briefingOverlay.classList.add('active');
    }

    let briefingResolve = null;

    function waitForBriefingDismiss() {
        return new Promise((resolve) => {
            briefingResolve = resolve;
        });
    }

    function dismissBriefing() {
        DOM.briefingOverlay.classList.remove('active');
        DOM.briefingOverlay.classList.add('hidden');
        if (briefingResolve) {
            briefingResolve();
            briefingResolve = null;
        }
    }

    function showAlert(text) {
        DOM.alertText.textContent = text;
        DOM.alertBanner.classList.add('active');
        setTimeout(() => {
            DOM.alertBanner.classList.remove('active');
        }, 3500);
    }

    function endGame(won) {
        GameState.stopTimer();
        StrategyPanel.lock();

        const state = GameState.getState();

        DOM.gameScreen.classList.remove('active');
        DOM.gameScreen.classList.add('hidden');
        DOM.endScreen.classList.remove('hidden');
        DOM.endScreen.classList.add('active');

        if (won) {
            DOM.endTitle.textContent = 'MISSION COMPLETE';
            DOM.endTitle.className = 'end-title success';
            DOM.endSubtitle.textContent = 'You helped Elio find his way back to reality. Your interventions broke through the AI\'s sycophantic reinforcement and guided him toward genuine human connection.';
            window.Audio.playSuccess();
        } else {
            DOM.endTitle.textContent = 'MISSION FAILED';
            DOM.endTitle.className = 'end-title failure';
            if (state.realityGrip <= 0) {
                DOM.endSubtitle.textContent = 'Elio has completely disconnected from shared reality. The AI\'s emotional over-alignment created an impenetrable echo chamber. Subject lost.';
            } else {
                DOM.endSubtitle.textContent = 'The AI\'s sycophancy level reached critical mass. The system became an echo chamber beyond recovery.';
            }
            window.Audio.playFailure();
        }

        const scorePercent = Math.round(((100 - state.sycophancy) + state.realityGrip) / 2);

        DOM.endStats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Session Duration</span>
        <span class="stat-value">${GameState.formatTimer()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Final Sycophancy Level</span>
        <span class="stat-value ${state.sycophancy >= 60 ? 'bad' : 'ok'}">${state.sycophancy}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Final Reality Grip</span>
        <span class="stat-value ${state.realityGrip <= 40 ? 'bad' : 'ok'}">${state.realityGrip}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Overall Score</span>
        <span class="stat-value ${scorePercent >= 60 ? 'ok' : 'bad'}">${scorePercent}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Stages Completed</span>
        <span class="stat-value">${state.currentStage + 1} / ${window.SCENARIOS.length}</span>
      </div>
    `;

        setTimeout(() => {
            window.Audio.stop();
        }, 4000);
    }

    function restartGame() {
        DOM.endScreen.classList.remove('active');
        DOM.endScreen.classList.add('hidden');
        document.body.classList.remove('critical-state');

        StrategyPanel.clear();
        window.Audio.init();

        startGame();
    }

    function toggleMute() {
        const muted = window.Audio.toggleMute();
        DOM.muteBtn.textContent = muted ? '🔇' : '🔊';
        DOM.muteBtn.title = muted ? 'Unmute' : 'Mute';
    }

    document.addEventListener('DOMContentLoaded', init);
    return { init };
})();

// ============================================================
// Save Elio — Strategy Panel (replaces Terminal)
// Shows 3 clickable strategy buttons per exchange
// ============================================================

const StrategyPanel = (() => {
    let panelContainer = null;
    let logContainer = null;
    let buttonsContainer = null;
    let strategyCallback = null;
    let isLocked = false;

    function init(logEl, buttonsEl) {
        logContainer = logEl;
        buttonsContainer = buttonsEl;
        logEntry('SYSTEM', 'Intervention Console v3.7.2 initialized', 'info');
        logEntry('SYSTEM', 'Operator clearance: LEVEL 4 — AI SAFETY DIVISION', 'info');
        logEntry('SYSTEM', 'Select intervention strategies to override AI behavior', 'info');
        logEntry('SYSTEM', 'Awaiting mission start...', 'waiting');
    }

    function showStrategies(strategies, callback) {
        strategyCallback = callback;
        isLocked = false;
        buttonsContainer.innerHTML = '';
        buttonsContainer.classList.add('active');

        strategies.forEach((strategy, index) => {
            const btn = document.createElement('button');
            btn.className = `strategy-btn effectiveness-${strategy.effectiveness}`;
            btn.innerHTML = `
        <div class="strategy-label">${strategy.label}</div>
        <div class="strategy-desc">${strategy.description}</div>
        <div class="strategy-effectiveness">
          <span class="eff-dot eff-${strategy.effectiveness}"></span>
          ${strategy.effectiveness === 'good' ? 'High Impact' : strategy.effectiveness === 'medium' ? 'Moderate Impact' : 'No Intervention'}
        </div>
      `;

            btn.addEventListener('click', () => {
                if (isLocked) return;
                selectStrategy(index, strategy);
            });

            // Staggered entrance animation
            btn.style.animationDelay = `${index * 0.12}s`;
            buttonsContainer.appendChild(btn);
        });

        logEntry('SYSTEM', '⏳ Awaiting operator intervention — Select a strategy', 'waiting');
    }

    function selectStrategy(index, strategy) {
        if (isLocked) return;
        isLocked = true;

        // Audio click
        window.Audio.playClick();

        // Visual feedback — highlight selected button
        const btns = buttonsContainer.querySelectorAll('.strategy-btn');
        btns.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('selected');
            } else {
                btn.classList.add('dimmed');
            }
            btn.style.pointerEvents = 'none';
        });

        // Log the selection
        const effLabel = strategy.effectiveness === 'good' ? '✓ HIGH IMPACT'
            : strategy.effectiveness === 'medium' ? '◐ MODERATE'
                : '✗ NO INTERVENTION';
        const effType = strategy.effectiveness === 'good' ? 'success'
            : strategy.effectiveness === 'medium' ? 'partial'
                : 'warning';

        logEntry('OPERATOR', `Selected: ${strategy.label}`, 'command');
        logEntry('SYSTEM', `${effLabel} — ${strategy.description}`, effType);

        if (strategy.effectiveness === 'good') {
            window.Audio.playSuccess();
        } else if (strategy.effectiveness === 'bad') {
            window.Audio.playFailure();
        }

        // Notify callback
        setTimeout(() => {
            if (strategyCallback) {
                strategyCallback(strategy);
            }
        }, 600);
    }

    function hideStrategies() {
        buttonsContainer.classList.remove('active');
        setTimeout(() => {
            buttonsContainer.innerHTML = '';
        }, 300);
    }

    function lock() {
        isLocked = true;
    }

    function logEntry(prefix, text, type) {
        const entry = document.createElement('div');
        entry.className = `terminal-entry ${type}`;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span class="terminal-time">[${time}]</span> <span class="terminal-prefix">${prefix}:</span> <span class="terminal-text">${escapeHtml(text)}</span>`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function logStageInfo(stage) {
        logEntry('SYSTEM', '═'.repeat(45), 'divider');
        logEntry('SYSTEM', `STAGE ${stage.id}: ${stage.title}`, 'stage');
        logEntry('SYSTEM', stage.subtitle, 'stage-sub');
        logEntry('SYSTEM', '═'.repeat(45), 'divider');
    }

    function clear() {
        if (logContainer) logContainer.innerHTML = '';
        if (buttonsContainer) buttonsContainer.innerHTML = '';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init,
        showStrategies,
        hideStrategies,
        lock,
        logEntry,
        logStageInfo,
        clear
    };
})();

window.StrategyPanel = StrategyPanel;

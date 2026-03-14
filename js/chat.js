// ============================================================
// Save Elio — Chat Simulation Engine
// Handles message rendering, typing animations, and conversation flow
// ============================================================

const Chat = (() => {
    let chatContainer = null;
    let isTyping = false;
    let pendingResolve = null;
    let messageQueue = [];

    function init(container) {
        chatContainer = container;
    }

    function clear() {
        if (chatContainer) chatContainer.innerHTML = '';
        messageQueue = [];
    }

    // Creates a timestamped message element
    function createMessageEl(sender, text, type) {
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message ${type}`;

        const header = document.createElement('div');
        header.className = 'message-header';

        const senderEl = document.createElement('span');
        senderEl.className = 'message-sender';

        const icon = document.createElement('span');
        icon.className = 'sender-icon';

        if (type === 'elio') {
            icon.textContent = '👤';
            senderEl.textContent = 'ELIO';
        } else if (type === 'ai-default' || type === 'ai-override' || type === 'ai-moderate') {
            icon.textContent = '🤖';
            if (type === 'ai-override') senderEl.textContent = 'AI [OVERRIDE ACTIVE]';
            else if (type === 'ai-moderate') senderEl.textContent = 'AI [PARTIAL OVERRIDE]';
            else senderEl.textContent = 'AI ASSISTANT';
        } else if (type === 'system') {
            icon.textContent = '⚠';
            senderEl.textContent = 'SYSTEM';
        }

        const timeEl = document.createElement('span');
        timeEl.className = 'message-time';
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        header.appendChild(icon);
        header.appendChild(senderEl);
        header.appendChild(timeEl);

        const body = document.createElement('div');
        body.className = 'message-body';

        wrapper.appendChild(header);
        wrapper.appendChild(body);

        return { wrapper, body };
    }

    // Typing animation — character by character
    function typeText(element, text, speed = 18) {
        return new Promise((resolve) => {
            isTyping = true;
            let i = 0;
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '█';
            element.appendChild(cursor);

            function tick() {
                if (i < text.length) {
                    // Insert character before cursor
                    const charNode = document.createTextNode(text[i]);
                    element.insertBefore(charNode, cursor);
                    i++;
                    scrollToBottom();

                    // Variable speed for natural feel
                    let delay = speed;
                    const char = text[i - 1];
                    if (char === '.' || char === '!' || char === '?') delay = speed * 8;
                    else if (char === ',') delay = speed * 4;
                    else if (char === '—' || char === ':') delay = speed * 5;
                    else if (char === '\n') delay = speed * 3;
                    else delay = speed + Math.random() * 12;

                    setTimeout(tick, delay);
                } else {
                    cursor.remove();
                    isTyping = false;
                    resolve();
                }
            }
            tick();
        });
    }

    // Show typing indicator before a message
    function showTypingIndicator(senderType) {
        const indicator = document.createElement('div');
        indicator.className = `chat-message ${senderType} typing-indicator-msg`;
        indicator.id = 'typing-indicator';

        const header = document.createElement('div');
        header.className = 'message-header';
        const senderEl = document.createElement('span');
        senderEl.className = 'message-sender';
        const icon = document.createElement('span');
        icon.className = 'sender-icon';

        if (senderType === 'elio') {
            icon.textContent = '👤';
            senderEl.textContent = 'ELIO';
        } else {
            icon.textContent = '🤖';
            senderEl.textContent = 'AI ASSISTANT';
        }
        header.appendChild(icon);
        header.appendChild(senderEl);

        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';

        indicator.appendChild(header);
        indicator.appendChild(dots);
        chatContainer.appendChild(indicator);
        scrollToBottom();

        return indicator;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // Post a full message with typing animation
    async function postMessage(sender, text, type, typeSpeed = 18) {
        // Show typing indicator first
        const indicator = showTypingIndicator(type);
        const thinkTime = 500 + Math.random() * 800;
        await delay(thinkTime);
        removeTypingIndicator();

        const { wrapper, body } = createMessageEl(sender, text, type);
        chatContainer.appendChild(wrapper);
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateY(10px)';

        // Animate in
        requestAnimationFrame(() => {
            wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateY(0)';
        });

        await typeText(body, text, typeSpeed);
        scrollToBottom();
    }

    // Post a system message (no typing)
    function postSystemMessage(text) {
        const { wrapper, body } = createMessageEl('SYSTEM', text, 'system');
        body.textContent = text;
        chatContainer.appendChild(wrapper);

        wrapper.style.opacity = '0';
        requestAnimationFrame(() => {
            wrapper.style.transition = 'opacity 0.5s ease';
            wrapper.style.opacity = '1';
        });

        scrollToBottom();
    }

    // Post a stage transition
    function postStageTransition(stage) {
        const div = document.createElement('div');
        div.className = 'stage-transition';
        div.innerHTML = `
      <div class="stage-line"></div>
      <div class="stage-label">
        <span class="stage-number">STAGE ${stage.id}</span>
        <span class="stage-title">${stage.title}</span>
      </div>
      <div class="stage-line"></div>
    `;
        chatContainer.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    return {
        init,
        clear,
        postMessage,
        postSystemMessage,
        postStageTransition,
        scrollToBottom,
        delay
    };
})();

window.Chat = Chat;

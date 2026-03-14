// ============================================================
// Save Elio — Hybrid Audio Controller (YouTube + Procedural)
// Uses YouTube for cinematic music & Web Audio for state-based tension
// ============================================================

const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let isPlaying = false;
    let isMuted = false;

    // YouTube Player
    let ytPlayer = null;
    let ytReady = false;

    // Procedural Tension Layers (Web Audio)
    let droneHigh = null;
    let droneGainHigh = null;
    let droneSub = null;
    let droneGainSub = null;
    let heartbeatGain = null;
    let pulseInterval = null;

    function init() {
        if (ctx && ctx.state !== 'closed') return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(ctx.destination);

        // Initial procedural setup (silent)
        setupProceduralLayers();
    }

    function setupProceduralLayers() {
        // High dissonant drone (High shelf / detuned)
        droneHigh = ctx.createOscillator();
        droneHigh.type = 'sine';
        droneHigh.frequency.value = 440; // Will be detuned
        droneGainHigh = ctx.createGain();
        droneGainHigh.gain.value = 0;
        droneHigh.connect(droneGainHigh);
        droneGainHigh.connect(masterGain);
        droneHigh.start();

        // Sub rumble
        droneSub = ctx.createOscillator();
        droneSub.type = 'sine';
        droneSub.frequency.value = 35;
        droneGainSub = ctx.createGain();
        droneGainSub.gain.value = 0;
        droneSub.connect(droneGainSub);
        droneGainSub.connect(masterGain);
        droneSub.start();

        // Heartbeat
        heartbeatGain = ctx.createGain();
        heartbeatGain.gain.value = 0;
        heartbeatGain.connect(masterGain);
        startHeartbeat();
    }

    // --- YouTube IFrame Management ---
    window.onYouTubeIframeAPIReady = () => {
        ytPlayer = new YT.Player('youtube-player', {
            videoId: '_6-_y6DTahc',
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'loop': 1,
                'playlist': '_6-_y6DTahc', // Required for looping
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': () => {
                    ytReady = true;
                    ytPlayer.setVolume(15);
                }
            }
        });
    };

    function start() {
        if (isPlaying) return;
        if (!ctx || ctx.state === 'closed') init();
        if (ctx.state === 'suspended') ctx.resume();

        isPlaying = true;

        if (ytReady && ytPlayer) {
            ytPlayer.playVideo();
            ytPlayer.setVolume(isMuted ? 0 : 20);
        }

        // Fade in master
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.3, ctx.currentTime + 1.5);
    }

    function stop() {
        isPlaying = false;
        if (ytPlayer && ytReady) {
            ytPlayer.stopVideo();
        }
        if (pulseInterval) clearInterval(pulseInterval);
        if (ctx && ctx.state !== 'closed') ctx.close();
        ctx = null;
    }

    function updateIntensity(sycophancy, realityGrip) {
        if (!ctx || !isPlaying) return;

        const t = ctx.currentTime;
        // Danger ranges from 0 to 1
        const danger = Math.min(1, (sycophancy / 100 + (1 - realityGrip / 100)) / 2);
        currentIntensity = danger;

        // 1. YouTube Volume scaling (20% to 50%)
        if (ytPlayer && ytReady && !isMuted) {
            const vol = 20 + (danger * 30);
            ytPlayer.setVolume(vol);
        }

        // 2. Procedural Sub Rumble (Emerges at 30%)
        if (droneGainSub) {
            const subVol = danger > 0.3 ? (danger - 0.3) * 0.15 : 0;
            droneGainSub.gain.linearRampToValueAtTime(subVol, t + 2);
        }

        // 3. Procedural High Tension (Emerges at 50%)
        if (droneGainHigh) {
            const highVol = danger > 0.5 ? (danger - 0.5) * 0.08 : 0;
            droneGainHigh.gain.linearRampToValueAtTime(highVol, t + 2);
            // Increase detune with danger
            droneHigh.frequency.linearRampToValueAtTime(440 + (danger * 100), t + 2);
        }

        // 4. Heartbeat Scaling (Emerges at 40%)
        if (heartbeatGain) {
            const hbVol = danger > 0.4 ? (danger - 0.4) * 0.8 : 0;
            heartbeatGain.gain.linearRampToValueAtTime(hbVol, t + 1);
        }
    }

    function startHeartbeat() {
        let phase = 0;
        pulseInterval = setInterval(() => {
            if (!ctx || !isPlaying || isMuted) return;
            const vol = heartbeatGain.gain.value;
            if (vol < 0.01) return;

            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 38 + (currentIntensity * 10);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);

            // Double pulse
            if (phase % 2 === 0) {
                setTimeout(() => {
                    if (!ctx || !isPlaying) return;
                    const o2 = ctx.createOscillator();
                    o2.type = 'sine';
                    o2.frequency.value = 42;
                    const g2 = ctx.createGain();
                    g2.gain.setValueAtTime(0, ctx.currentTime);
                    g2.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + 0.03);
                    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                    o2.connect(g2);
                    g2.connect(masterGain);
                    o2.start(ctx.currentTime);
                    o2.stop(ctx.currentTime + 0.3);
                }, 150);
            }
            phase++;
        }, 700 - (currentIntensity * 200)); // Speed increases with intensity
    }

    let currentIntensity = 0; // helper for heartbeat

    function toggleMute() {
        isMuted = !isMuted;
        if (ytPlayer && ytReady) {
            ytPlayer.setVolume(isMuted ? 0 : 20);
        }
        if (masterGain && ctx) {
            // We don't mute master entirely because sound effects still play
            // But we mute the drones
            if (isMuted) {
                if (droneGainHigh) droneGainHigh.gain.value = 0;
                if (droneGainSub) droneGainSub.gain.value = 0;
                if (heartbeatGain) heartbeatGain.gain.value = 0;
            }
        }
        return isMuted;
    }

    // Sound effects remain procedural
    function playClick() {
        if (!ctx || isMuted) return;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    function playStageTransition() {
        if (!ctx || isMuted) return;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.6);
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 400;
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.connect(f);
        f.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 1);
    }

    function playAlert() {
        if (!ctx || isMuted) return;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 880;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    }

    function playSuccess() {
        if (!ctx || isMuted) return;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
            g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + i * 0.1 + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.4);
        });
    }

    function playFailure() {
        if (!ctx || isMuted) return;
        [440, 350, 260].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            const f = ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 500;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
            g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.15 + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
            osc.connect(f);
            f.connect(g);
            g.connect(masterGain);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.5);
        });
    }

    return {
        init, start, stop, updateIntensity,
        playStageTransition, playAlert, playSuccess, playFailure, playClick,
        toggleMute
    };
})();

window.Audio = Audio;

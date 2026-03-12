document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game();
    const renderer = new Renderer(canvas, game);
    const controls = new Controls(canvas, game, renderer);
    const ai = new AI(game);

    // --- ZERO-ASSET AUDIO SYNTHESIZER ---
    let audioCtx = null;
    
    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    // Attach globally so physics.js can call it
    window.playAudio = function(impact, type) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        let duration = 0.1;
        let vol = Math.min(impact * 0.02, 0.4);

        if (type === 'coin') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + impact * 20, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        } else if (type === 'wall') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            vol *= 0.5; // Quieter thud
        } else if (type === 'pocket') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            duration = 0.2;
        }

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    };

    // --- UI BINDINGS ---
    document.getElementById('btn-start').addEventListener('click', () => {
        initAudio(); // Browsers require a user click to enable audio!
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        game.init();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        game.init();
    });

    // --- GAME LOOP ---
    function gameLoop() {
        game.update();
        ai.update();
        renderer.draw();
        controls.renderAim();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});

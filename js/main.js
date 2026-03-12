document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game();
    const renderer = new Renderer(canvas, game);
    const controls = new Controls(canvas, game, renderer);
    const ai = new AI(game);

    let audioCtx = null;
    
    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

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
            vol *= 0.5; 
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

    function startGame(e) {
        e.preventDefault();
        initAudio(); 
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        game.init();
    }

    function restartGame(e) {
        e.preventDefault();
        document.getElementById('game-over').classList.add('hidden');
        game.init();
    }

    // Support both click and touch for UI
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-start').addEventListener('touchstart', startGame, {passive: false});

    document.getElementById('btn-restart').addEventListener('click', restartGame);
    document.getElementById('btn-restart').addEventListener('touchstart', restartGame, {passive: false});

    function gameLoop() {
        game.update();
        ai.update();
        renderer.draw();
        controls.renderAim();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});

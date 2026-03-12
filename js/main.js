document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game();
    const renderer = new Renderer(canvas, game);
    const controls = new Controls(canvas, game, renderer);
    const ai = new AI(game);

    // UI Buttons
    document.getElementById('btn-start').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        game.init();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        game.init();
    });

    // Main Game Loop using requestAnimationFrame
    function gameLoop() {
        game.update();
        ai.update();
        renderer.draw();
        controls.renderAim(); // Draw aim line on top of everything
        requestAnimationFrame(gameLoop);
    }

    // Start loop
    gameLoop();
});

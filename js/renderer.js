class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        this.drawParticles();
        this.drawCoins();
    }

    drawBoard() {
        // Wood finish
        this.ctx.fillStyle = '#e5aa70';
        this.ctx.fillRect(0, 0, this.game.boardSize, this.game.boardSize);
        
        // Borders
        this.ctx.fillStyle = '#4a2e1b';
        this.ctx.fillRect(0, 0, this.game.boardSize, this.game.margin);
        this.ctx.fillRect(0, this.game.boardSize - this.game.margin, this.game.boardSize, this.game.margin);
        this.ctx.fillRect(0, 0, this.game.margin, this.game.boardSize);
        this.ctx.fillRect(this.game.boardSize - this.game.margin, 0, this.game.margin, this.game.boardSize);

        // Center art
        this.ctx.beginPath(); this.ctx.arc(400, 400, 60, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#c0392b'; this.ctx.lineWidth = 3; this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(400, 400, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = '#c0392b'; this.ctx.fill();

        // Baselines (Where you place the striker)
        this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(200, 150); this.ctx.lineTo(600, 150); this.ctx.stroke(); // AI Baseline
        this.ctx.beginPath(); this.ctx.moveTo(200, 650); this.ctx.lineTo(600, 650); this.ctx.stroke(); // Player Baseline
        
        // Baseline circles
        this.ctx.fillStyle = '#c0392b';
        [ [200,150], [600,150], [200,650], [600,650] ].forEach(pos => {
            this.ctx.beginPath(); this.ctx.arc(pos[0], pos[1], 15, 0, Math.PI*2); this.ctx.fill();
            this.ctx.stroke();
        });

        // Pockets
        this.ctx.fillStyle = '#111';
        for (let pocket of this.game.pockets) {
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, this.game.pocketRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawCoins() {
        for (let coin of this.game.coins) {
            if (!coin.active) continue;
            
            // 3D Gradient effect
            let grad = this.ctx.createRadialGradient(coin.pos.x - 5, coin.pos.y - 5, coin.radius * 0.2, coin.pos.x, coin.pos.y, coin.radius);
            grad.addColorStop(0, '#fff'); // Highlight
            grad.addColorStop(0.3, coin.color); 
            grad.addColorStop(1, '#000'); // Shadow edge

            this.ctx.beginPath();
            this.ctx.arc(coin.pos.x, coin.pos.y, coin.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();
            
            // Striker ring pattern
            if (coin.type === 'striker') {
                this.ctx.beginPath();
                this.ctx.arc(coin.pos.x, coin.pos.y, coin.radius * 0.6, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#3498db';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    drawParticles() {
        for (let p of this.game.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.pos.x, p.pos.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;
    }

    drawAimLine(startPoint, endPoint) {
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 8]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw target circle at the end of the line
        this.ctx.beginPath();
        this.ctx.arc(endPoint.x, endPoint.y, this.game.striker.radius, 0, Math.PI*2);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.stroke();
    }
}

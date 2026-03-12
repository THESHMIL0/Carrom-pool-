class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        this.drawCoins();
    }

    drawBoard() {
        // Wooden board background
        this.ctx.fillStyle = '#d4a373';
        this.ctx.fillRect(0, 0, this.game.boardSize, this.game.boardSize);
        
        // Borders
        this.ctx.fillStyle = '#5c4033';
        this.ctx.fillRect(0, 0, this.game.boardSize, this.game.margin);
        this.ctx.fillRect(0, this.game.boardSize - this.game.margin, this.game.boardSize, this.game.margin);
        this.ctx.fillRect(0, 0, this.game.margin, this.game.boardSize);
        this.ctx.fillRect(this.game.boardSize - this.game.margin, 0, this.game.margin, this.game.boardSize);

        // Center circles
        this.ctx.beginPath();
        this.ctx.arc(400, 400, 60, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

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
            
            this.ctx.beginPath();
            this.ctx.arc(coin.pos.x, coin.pos.y, coin.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = coin.color;
            this.ctx.fill();
            
            // Add a little sheen to make them look 3D
            this.ctx.beginPath();
            this.ctx.arc(coin.pos.x - 3, coin.pos.y - 3, coin.radius * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.fill();
        }
    }

    drawAimLine(startPoint, endPoint) {
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}

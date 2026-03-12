class Game {
    constructor() {
        this.boardSize = 800;
        this.margin = 50;
        this.pockets = [
            new Vector(this.margin, this.margin),
            new Vector(this.boardSize - this.margin, this.margin),
            new Vector(this.margin, this.boardSize - this.margin),
            new Vector(this.boardSize - this.margin, this.boardSize - this.margin)
        ];
        this.pocketRadius = 35;
        this.coins = [];
        this.striker = null;
        
        this.state = 'menu'; // menu, playing, gameover
        this.turn = 'player'; // player, ai
        this.playerScore = 0;
        this.aiScore = 0;
        
        this.isPiecesMoving = false;
        this.foulCommitted = false;
        this.scoredThisTurn = false;
    }

    init() {
        this.coins = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.turn = 'player';
        
        // Setup Striker
        this.striker = new Coin(400, 650, 20, 1.5, '#ecf0f1', 'striker');
        this.coins.push(this.striker);

        // Setup Carrom Coins (Simplified Circle Layout)
        const center = new Vector(400, 400);
        this.coins.push(new Coin(center.x, center.y, 15, 1, '#e74c3c', 'queen'));
        
        // Arrange coins in a ring
        let radius = 32;
        for (let i = 0; i < 6; i++) {
            let angle = (i * Math.PI * 2) / 6;
            let type = i % 2 === 0 ? 'white' : 'black';
            let color = type === 'white' ? '#f5f6fa' : '#2f3640';
            this.coins.push(new Coin(center.x + Math.cos(angle)*radius, center.y + Math.sin(angle)*radius, 15, 1, color, type));
        }

        this.updateUI();
        this.state = 'playing';
    }

    update() {
        if (this.state !== 'playing') return;

        this.isPiecesMoving = false;

        // Update physics
        for (let coin of this.coins) {
            coin.update();
            coin.checkWallCollision(this.boardSize, this.margin);
            if (coin.vel.mag() > 0) this.isPiecesMoving = true;
        }

        // Check collisions
        for (let i = 0; i < this.coins.length; i++) {
            for (let j = i + 1; j < this.coins.length; j++) {
                resolveCollision(this.coins[i], this.coins[j]);
            }
        }

        // Check pockets
        for (let coin of this.coins) {
            if (!coin.active) continue;
            for (let pocket of this.pockets) {
                if (coin.pos.sub(pocket).mag() < this.pocketRadius) {
                    this.handlePocket(coin);
                }
            }
        }

        // Handle turn transitions when all pieces stop
        if (!this.isPiecesMoving && this.striker.vel.mag() === 0 && this.state === 'playing') {
            if (this.striker.active === false) {
                // Striker foul reset
                this.striker.active = true;
                this.striker.pos = new Vector(400, this.turn === 'player' ? 650 : 150);
                this.foulCommitted = true;
            }

            // Simple turn logic: if you didn't score, or committed a foul, switch turns
            if (!this.scoredThisTurn || this.foulCommitted) {
                if(this.turn === 'player') { this.turn = 'ai'; this.striker.pos = new Vector(400, 150); }
                else { this.turn = 'player'; this.striker.pos = new Vector(400, 650); }
                this.updateUI();
            }

            // Reset flags for next turn
            this.scoredThisTurn = false;
            this.foulCommitted = false;
            
            // Check win condition (all white/black coins gone)
            this.checkWin();
        }
    }

    handlePocket(coin) {
        coin.active = false;
        coin.vel = new Vector(0,0);
        
        if (coin.type === 'striker') {
            this.foulCommitted = true;
        } else if (coin.type === 'white') {
            if(this.turn === 'player') { this.playerScore++; this.scoredThisTurn = true; }
            else { this.turn = 'ai'; } // opponent scored your coin
        } else if (coin.type === 'black') {
            if(this.turn === 'ai') { this.aiScore++; this.scoredThisTurn = true; }
            else { this.turn = 'player'; } // opponent scored your coin
        } else if (coin.type === 'queen') {
            if(this.turn === 'player') this.playerScore += 3;
            if(this.turn === 'ai') this.aiScore += 3;
            this.scoredThisTurn = true;
        }
        this.updateUI();
    }

    checkWin() {
        let whiteCount = this.coins.filter(c => c.type === 'white' && c.active).length;
        let blackCount = this.coins.filter(c => c.type === 'black' && c.active).length;
        
        if (whiteCount === 0 || blackCount === 0) {
            this.state = 'gameover';
            document.getElementById('game-over').classList.remove('hidden');
            document.getElementById('winner-text').innerText = this.playerScore > this.aiScore ? 'You Win!' : 'AI Wins!';
        }
    }

    updateUI() {
        document.getElementById('score-player').innerText = this.playerScore;
        document.getElementById('score-ai').innerText = this.aiScore;
        document.getElementById('turn-indicator').innerText = this.turn === 'player' ? "Player's Turn" : "AI's Turn";
    }
}

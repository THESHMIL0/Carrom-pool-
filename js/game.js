class Game {
    constructor() {
        this.boardSize = 800;
        this.margin = 55;
        this.pockets = [
            new Vector(this.margin, this.margin),
            new Vector(this.boardSize - this.margin, this.margin),
            new Vector(this.margin, this.boardSize - this.margin),
            new Vector(this.boardSize - this.margin, this.boardSize - this.margin)
        ];
        this.pocketRadius = 38;
        this.coins = [];
        this.particles = []; 
        this.striker = null;
        this.queen = null;
        
        this.state = 'menu'; 
        this.turn = 'player'; 
        this.playerScore = 0;
        this.aiScore = 0;
        
        this.isPiecesMoving = false;
        this.foulCommitted = false;
        this.scoredThisTurn = false;
        this.queenState = 'on_board'; 
        this.pocketedThisTurn = [];
    }

    init() {
        this.coins = [];
        this.particles = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.turn = 'player';
        this.queenState = 'on_board';
        
        this.striker = new Coin(400, 650, 22, 1.5, '#ecf0f1', 'striker');
        this.coins.push(this.striker);

        const center = new Vector(400, 400);
        this.queen = new Coin(center.x, center.y, 16, 1, '#e74c3c', 'queen');
        this.coins.push(this.queen);
        
        let radius = 34;
        for (let i = 0; i < 6; i++) {
            let angle = (i * Math.PI * 2) / 6;
            let type = i % 2 === 0 ? 'white' : 'black';
            let color = type === 'white' ? '#f5f6fa' : '#2f3640';
            this.coins.push(new Coin(center.x + Math.cos(angle)*radius, center.y + Math.sin(angle)*radius, 16, 1, color, type));
        }

        this.state = 'placement';
        this.updateUI();
    }

    update() {
        if (this.state === 'gameover' || this.state === 'menu') return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.pos = p.pos.add(p.vel);
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.state === 'placement') return;

        this.isPiecesMoving = false;

        for (let coin of this.coins) {
            coin.update();
            coin.checkWallCollision(this.boardSize, this.margin, this);
            if (coin.vel.mag() > 0) this.isPiecesMoving = true;
        }

        for (let i = 0; i < this.coins.length; i++) {
            for (let j = i + 1; j < this.coins.length; j++) {
                resolveCollision(this.coins[i], this.coins[j], this);
            }
        }

        for (let coin of this.coins) {
            if (!coin.active) continue;
            for (let pocket of this.pockets) {
                if (coin.pos.sub(pocket).mag() < this.pocketRadius) {
                    this.handlePocket(coin);
                }
            }
        }

        if (!this.isPiecesMoving && this.striker.vel.mag() === 0 && this.state === 'playing') {
            this.evaluateTurnEnd();
        }
    }

    handlePocket(coin) {
        coin.active = false;
        coin.vel = new Vector(0,0);
        this.pocketedThisTurn.push(coin);
        if (window.playAudio) window.playAudio(10, 'pocket');
        
        if (coin.type === 'striker') {
            this.foulCommitted = true;
        } else if (coin.type === 'queen') {
            this.queenState = 'pocketed_uncovered';
            this.scoredThisTurn = true;
        } else if (coin.type === 'white') {
            if (this.turn === 'player') {
                this.playerScore++; this.scoredThisTurn = true;
                if (this.queenState === 'pocketed_uncovered') this.queenState = 'covered';
            } else { this.turn = 'ai'; } 
        } else if (coin.type === 'black') {
            if (this.turn === 'ai') {
                this.aiScore++; this.scoredThisTurn = true;
                if (this.queenState === 'pocketed_uncovered') this.queenState = 'covered';
            } else { this.turn = 'player'; }
        }
        this.updateUI();
    }

    evaluateTurnEnd() {
        if (this.queenState === 'pocketed_uncovered' && !this.scoredThisTurn) {
            this.queen.active = true;
            this.queen.pos = new Vector(400, 400);
            this.queenState = 'on_board';
            this.foulCommitted = true; 
        } else if (this.queenState === 'covered') {
            if (this.turn === 'player') this.playerScore += 3;
            else this.aiScore += 3;
            this.queenState = 'scored'; 
        }

        if (!this.scoredThisTurn || this.foulCommitted) {
            this.turn = this.turn === 'player' ? 'ai' : 'player';
        }

        this.striker.active = true;
        this.striker.pos = new Vector(400, this.turn === 'player' ? 650 : 150);
        this.state = 'placement';
        
        this.scoredThisTurn = false;
        this.foulCommitted = false;
        this.pocketedThisTurn = [];
        
        this.updateUI();
        this.checkWin();
    }

    spawnParticles(pos, intensity) {
        let count = Math.min(Math.floor(intensity), 15);
        for (let i=0; i<count; i++) {
            this.particles.push({
                pos: new Vector(pos.x, pos.y),
                vel: new Vector((Math.random()-0.5)*5, (Math.random()-0.5)*5),
                life: 1.0,
                color: '#f1c40f'
            });
        }
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
        
        let turnText = this.state === 'placement' ? "Place Striker" : (this.turn === 'player' ? "Your Turn" : "AI Thinking...");
        document.getElementById('turn-indicator').innerText = turnText;
        
        let statusEl = document.getElementById('status-message');
        if (this.queenState === 'pocketed_uncovered') {
            statusEl.classList.remove('hidden');
        } else {
            statusEl.classList.add('hidden');
        }
    }
}

class AI {
    constructor(game) {
        this.game = game;
        this.thinkingTime = 0;
    }

    update() {
        if (this.game.state !== 'playing' || this.game.turn !== 'ai' || this.game.isPiecesMoving) {
            this.thinkingTime = 0;
            return;
        }

        this.thinkingTime++;
        
        // Wait 1 second (60 frames) before shooting to simulate "thinking"
        if (this.thinkingTime > 60) {
            this.takeShot();
            this.thinkingTime = 0;
        }
    }

    takeShot() {
        // 1. Find a valid target (Black coin or Queen)
        let targets = this.game.coins.filter(c => (c.type === 'black' || c.type === 'queen') && c.active);
        
        if (targets.length === 0) return; // Nothing to shoot

        // Pick the first available target for basic logic
        let target = targets[0]; 

        // 2. Aim directly at the target (Basic difficulty AI)
        let aimVector = target.pos.sub(this.game.striker.pos);
        let direction = aimVector.normalize();
        
        // 3. Apply randomized power
        let power = 15 + Math.random() * 10; 
        
        // Add slight inaccuracy (Hard mode would have less randomness)
        direction.x += (Math.random() - 0.5) * 0.1;
        direction.y += (Math.random() - 0.5) * 0.1;

        this.game.striker.vel = direction.normalize().mult(power);
    }
}

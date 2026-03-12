class AI {
    constructor(game) {
        this.game = game;
        this.timer = 0;
    }

    update() {
        if (this.game.turn !== 'ai' || this.game.isPiecesMoving) {
            this.timer = 0; return;
        }

        this.timer++;

        if (this.game.state === 'placement' && this.timer > 30) {
            // Randomly place AI striker on its baseline
            this.game.striker.pos.x = 200 + Math.random() * 400;
            this.game.state = 'playing';
            this.game.updateUI();
            this.timer = 0;
        }

        if (this.game.state === 'playing' && this.timer > 60) {
            this.calculateAndShoot();
            this.timer = 0;
        }
    }

    calculateAndShoot() {
        // Find targets: Queen (if available/needed) or Black coins
        let targets = this.game.coins.filter(c => c.active && (c.type === 'black' || c.type === 'queen'));
        if (targets.length === 0) return;

        let bestShot = null;
        let shortestDist = Infinity;

        // Try to calculate "Cut Angle" (Ghost ball position)
        for (let target of targets) {
            for (let pocket of this.game.pockets) {
                // Vector from pocket to target coin
                let pocketToTarget = target.pos.sub(pocket);
                let distToPocket = pocketToTarget.mag();
                
                // If the path is backwards, ignore (simplified AI check)
                if (pocketToTarget.dot(new Vector(0,1)) < 0 && pocket.y > 400) continue; 

                // Ghost ball position: Where the striker needs to be at the moment of impact
                let dirAwayFromPocket = pocketToTarget.normalize();
                let ghostPos = target.pos.add(dirAwayFromPocket.mult(target.radius + this.game.striker.radius));

                // Vector from Striker to Ghost Ball
                let aimVec = ghostPos.sub(this.game.striker.pos);
                let distToGhost = aimVec.mag();

                if (distToGhost < shortestDist) {
                    shortestDist = distToGhost;
                    bestShot = aimVec;
                }
            }
        }

        // Apply shot
        if (bestShot) {
            let direction = bestShot.normalize();
            let power = Math.min(20 + (shortestDist * 0.05), 35); // Power based on distance
            
            // Add slight imperfection based on difficulty
            direction.x += (Math.random() - 0.5) * 0.05;
            direction.y += (Math.random() - 0.5) * 0.05;

            this.game.striker.vel = direction.normalize().mult(power);
        } else {
            // Fallback: hit randomly
            this.game.striker.vel = new Vector(Math.random()-0.5, 1).normalize().mult(25);
        }
    }
}

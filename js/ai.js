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
        let targets = this.game.coins.filter(c => c.active && (c.type === 'black' || c.type === 'queen'));
        if (targets.length === 0) return;

        let bestShot = null;
        let shortestDist = Infinity;

        for (let target of targets) {
            for (let pocket of this.game.pockets) {
                let pocketToTarget = target.pos.sub(pocket);
                let distToPocket = pocketToTarget.mag();
                
                if (pocketToTarget.dot(new Vector(0,1)) < 0 && pocket.y > 400) continue; 

                let dirAwayFromPocket = pocketToTarget.normalize();
                let ghostPos = target.pos.add(dirAwayFromPocket.mult(target.radius + this.game.striker.radius));

                let aimVec = ghostPos.sub(this.game.striker.pos);
                let distToGhost = aimVec.mag();

                if (distToGhost < shortestDist) {
                    shortestDist = distToGhost;
                    bestShot = aimVec;
                }
            }
        }

        if (bestShot) {
            let direction = bestShot.normalize();
            let power = Math.min(20 + (shortestDist * 0.05), 35); 
            
            direction.x += (Math.random() - 0.5) * 0.05;
            direction.y += (Math.random() - 0.5) * 0.05;

            this.game.striker.vel = direction.normalize().mult(power);
        } else {
            this.game.striker.vel = new Vector(Math.random()-0.5, 1).normalize().mult(25);
        }
    }
}

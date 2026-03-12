class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let m = this.mag(); return m === 0 ? new Vector(0,0) : new Vector(this.x/m, this.y/m); }
    dot(v) { return this.x * v.x + this.y * v.y; }
}

class Coin {
    constructor(x, y, radius, mass, color, type) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.type = type; 
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.vel = this.vel.mult(0.985); 
        if (this.vel.mag() < 0.05) this.vel = new Vector(0,0);
    }

    checkWallCollision(boardSize, margin, game) {
        if (!this.active) return;
        let bounced = false;
        let impact = this.vel.mag();
        
        if (this.pos.x - this.radius < margin) { this.pos.x = margin + this.radius; this.vel.x *= -0.8; bounced = true; }
        if (this.pos.x + this.radius > boardSize - margin) { this.pos.x = boardSize - margin - this.radius; this.vel.x *= -0.8; bounced = true; }
        if (this.pos.y - this.radius < margin) { this.pos.y = margin + this.radius; this.vel.y *= -0.8; bounced = true; }
        if (this.pos.y + this.radius > boardSize - margin) { this.pos.y = boardSize - margin - this.radius; this.vel.y *= -0.8; bounced = true; }

        if (bounced && impact > 2 && window.playAudio) {
            window.playAudio(impact, 'wall');
        }
    }
}

function resolveCollision(c1, c2, game) {
    if (!c1.active || !c2.active) return;
    
    let diff = c1.pos.sub(c2.pos);
    let dist = diff.mag();
    let minDist = c1.radius + c2.radius;

    if (dist < minDist) {
        let overlap = minDist - dist;
        let normal = diff.normalize();
        let separation = normal.mult(overlap / 2);
        c1.pos = c1.pos.add(separation);
        c2.pos = c2.pos.sub(separation);

        let relVel = c1.vel.sub(c2.vel);
        let speed = relVel.dot(normal);
        if (speed > 0) return;

        let restitution = 0.85; 
        let impulse = -(1 + restitution) * speed / (1/c1.mass + 1/c2.mass);
        
        let impulseVec = normal.mult(impulse);
        c1.vel = c1.vel.add(impulseVec.mult(1/c1.mass));
        c2.vel = c2.vel.sub(impulseVec.mult(1/c2.mass));

        let impactForce = Math.abs(speed);
        if (impactForce > 1 && window.playAudio) window.playAudio(impactForce, 'coin');
        if (impactForce > 5 && game) game.spawnParticles(c1.pos.add(c2.pos).mult(0.5), impactForce);
    }
}

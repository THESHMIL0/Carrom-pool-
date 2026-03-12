// Vector utility for physics calculations
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let m = this.mag(); return m === 0 ? new Vector(0,0) : new Vector(this.x/m, this.y/m); }
    dot(v) { return this.x * v.x + this.y * v.y; }
}

// Game Object representing a coin or striker
class Coin {
    constructor(x, y, radius, mass, color, type) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.type = type; // 'striker', 'white', 'black', 'queen'
        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        // Apply velocity
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // Apply friction to slow down over time
        this.vel = this.vel.mult(0.985);

        // Stop completely if moving very slowly
        if (this.vel.mag() < 0.1) {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    }

    // Boundary collision (Board walls)
    checkWallCollision(boardSize, margin) {
        if (!this.active) return;
        if (this.pos.x - this.radius < margin) { this.pos.x = margin + this.radius; this.vel.x *= -0.8; }
        if (this.pos.x + this.radius > boardSize - margin) { this.pos.x = boardSize - margin - this.radius; this.vel.x *= -0.8; }
        if (this.pos.y - this.radius < margin) { this.pos.y = margin + this.radius; this.vel.y *= -0.8; }
        if (this.pos.y + this.radius > boardSize - margin) { this.pos.y = boardSize - margin - this.radius; this.vel.y *= -0.8; }
    }
}

// Check and resolve collision between two coins
function resolveCollision(c1, c2) {
    if (!c1.active || !c2.active) return;
    
    let diff = c1.pos.sub(c2.pos);
    let dist = diff.mag();
    let minDist = c1.radius + c2.radius;

    // If circles overlap
    if (dist < minDist) {
        // 1. Separate them to avoid sticking
        let overlap = minDist - dist;
        let normal = diff.normalize();
        let separation = normal.mult(overlap / 2);
        
        c1.pos = c1.pos.add(separation);
        c2.pos = c2.pos.sub(separation);

        // 2. Calculate new velocities (1D elastic collision along normal)
        let relVel = c1.vel.sub(c2.vel);
        let speed = relVel.dot(normal);

        // If moving apart, do nothing
        if (speed > 0) return;

        let restitution = 0.8; // Bounciness
        let impulse = -(1 + restitution) * speed / (1/c1.mass + 1/c2.mass);

        let impulseVec = normal.mult(impulse);
        c1.vel = c1.vel.add(impulseVec.mult(1/c1.mass));
        c2.vel = c2.vel.sub(impulseVec.mult(1/c2.mass));
    }
}

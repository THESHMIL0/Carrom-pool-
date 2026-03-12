class Controls {
    constructor(canvas, game, renderer) {
        this.canvas = canvas;
        this.game = game;
        this.renderer = renderer;
        this.isDragging = false;
        this.dragStart = new Vector(0,0);
        this.dragCurrent = new Vector(0,0);

        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.game.state !== 'playing' || this.game.turn !== 'player' || this.game.isPiecesMoving) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            let mouseVec = new Vector(mouseX, mouseY);

            // Check if clicking near the striker
            if (mouseVec.sub(this.game.striker.pos).mag() < this.game.striker.radius * 2) {
                this.isDragging = true;
                this.dragStart = mouseVec;
                this.dragCurrent = mouseVec;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            this.dragCurrent = new Vector(e.clientX - rect.left, e.clientY - rect.top);
        });

        this.canvas.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            // Calculate strike vector (opposite to drag direction)
            let pullVector = this.dragStart.sub(this.dragCurrent);
            let power = Math.min(pullVector.mag() * 0.15, 30); // Cap max power
            
            if (power > 1) {
                let direction = pullVector.normalize();
                this.game.striker.vel = direction.mult(power);
            }
        });
    }

    renderAim() {
        if (this.isDragging && !this.game.isPiecesMoving) {
            let pullVector = this.dragStart.sub(this.dragCurrent);
            let aimDirection = this.game.striker.pos.add(pullVector);
            this.renderer.drawAimLine(this.game.striker.pos, aimDirection);
        }
    }
}

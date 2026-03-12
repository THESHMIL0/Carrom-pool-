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
            if (this.game.turn !== 'player' || this.game.isPiecesMoving) return;
            
            const rect = this.canvas.getBoundingClientRect();
            let mouseVec = new Vector(e.clientX - rect.left, e.clientY - rect.top);

            if (this.game.state === 'placement') {
                // Lock placement and enter playing state
                this.game.state = 'playing';
                this.game.updateUI();
                return;
            }

            if (this.game.state === 'playing' && mouseVec.sub(this.game.striker.pos).mag() < this.game.striker.radius * 3) {
                this.isDragging = true;
                this.dragStart = mouseVec;
                this.dragCurrent = mouseVec;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            let mouseVec = new Vector(e.clientX - rect.left, e.clientY - rect.top);

            if (this.game.state === 'placement' && this.game.turn === 'player') {
                // Slide striker along baseline (X bounds: 200 to 600)
                this.game.striker.pos.x = Math.max(200, Math.min(600, mouseVec.x));
            }

            if (this.isDragging) {
                this.dragCurrent = mouseVec;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            let pullVector = this.dragStart.sub(this.dragCurrent);
            let power = Math.min(pullVector.mag() * 0.18, 35); 
            
            if (power > 2) {
                let direction = pullVector.normalize();
                this.game.striker.vel = direction.mult(power);
            }
        });
    }

    renderAim() {
        if (this.isDragging && !this.game.isPiecesMoving && this.game.state === 'playing') {
            let pullVector = this.dragStart.sub(this.dragCurrent);
            // Extrapolate the line to show trajectory
            let aimDirection = this.game.striker.pos.add(pullVector.normalize().mult(pullVector.mag() * 3));
            this.renderer.drawAimLine(this.game.striker.pos, aimDirection);
        }
    }
}

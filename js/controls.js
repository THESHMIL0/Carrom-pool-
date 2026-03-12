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

    // Unifies touch and mouse coordinates, accounting for CSS scaling
    getInputPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate scale (Logic size 800 / Physical CSS size)
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return new Vector(
            (clientX - rect.left) * scaleX,
            (clientY - rect.top) * scaleY
        );
    }

    initEvents() {
        const handleDown = (e) => {
            if (e.type === 'touchstart') e.preventDefault(); // Prevent scrolling
            if (this.game.turn !== 'player' || this.game.isPiecesMoving) return;
            
            let inputVec = this.getInputPos(e);

            if (this.game.state === 'placement') {
                this.game.state = 'playing';
                this.game.updateUI();
                return;
            }

            if (this.game.state === 'playing' && inputVec.sub(this.game.striker.pos).mag() < this.game.striker.radius * 4) {
                this.isDragging = true;
                this.dragStart = inputVec;
                this.dragCurrent = inputVec;
            }
        };

        const handleMove = (e) => {
            if (e.type === 'touchmove') e.preventDefault();
            let inputVec = this.getInputPos(e);

            if (this.game.state === 'placement' && this.game.turn === 'player') {
                this.game.striker.pos.x = Math.max(200, Math.min(600, inputVec.x));
            }

            if (this.isDragging) {
                this.dragCurrent = inputVec;
            }
        };

        const handleUp = (e) => {
            if (e.type === 'touchend') e.preventDefault();
            if (!this.isDragging) return;
            this.isDragging = false;
            
            let pullVector = this.dragStart.sub(this.dragCurrent);
            let power = Math.min(pullVector.mag() * 0.18, 35); 
            
            if (power > 2) {
                let direction = pullVector.normalize();
                this.game.striker.vel = direction.mult(power);
            }
        };

        // Mouse Events
        this.canvas.addEventListener('mousedown', handleDown);
        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('mouseup', handleUp);

        // Touch Events (passive: false is needed to allow e.preventDefault)
        this.canvas.addEventListener('touchstart', handleDown, { passive: false });
        this.canvas.addEventListener('touchmove', handleMove, { passive: false });
        this.canvas.addEventListener('touchend', handleUp, { passive: false });
    }

    renderAim() {
        if (this.isDragging && !this.game.isPiecesMoving && this.game.state === 'playing') {
            let pullVector = this.dragStart.sub(this.dragCurrent);
            let aimDirection = this.game.striker.pos.add(pullVector.normalize().mult(pullVector.mag() * 3));
            this.renderer.drawAimLine(this.game.striker.pos, aimDirection);
        }
    }
}

// js/timer.js
export class GameTimer {
    constructor() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.isPaused = false;
        this.isRunning = false;
    }

    start() {
        this.startTime = Date.now();
        this.pausedTime = 0;
        this.isPaused = false;
        this.isRunning = true;
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.pausedTime = Date.now();
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            this.startTime += (Date.now() - this.pausedTime);
            this.isPaused = false;
        }
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    reset() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.isPaused = false;
        this.isRunning = false;
    }

    getElapsedTime() {
        if (!this.isRunning) return 0;
        
        if (this.isPaused) {
            return this.pausedTime - this.startTime;
        }
        
        return Date.now() - this.startTime;
    }

    getFormattedTime() {
        const elapsed = this.getElapsedTime();
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((elapsed % 1000) / 10); // Get centiseconds (0-99)
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    draw(ctx, x, y) {
        ctx.fillStyle = "white";
        ctx.font = "24px 'Courier New', Courier, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Time: ${this.getFormattedTime()}`, x, y);
    }
}
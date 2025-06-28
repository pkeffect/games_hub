// js/timer.js

export class GameTimer {
    constructor() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isPaused = false;
        this.isRunning = false;
        this.laps = [];
        this.precision = 10; // Centiseconds (1/100th of a second)
        
        // Performance monitoring
        this.lastUpdate = 0;
        this.updateInterval = 16; // ~60fps updates
    }

    start() {
        this.startTime = performance.now();
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isPaused = false;
        this.isRunning = true;
        this.laps = [];
        this.lastUpdate = this.startTime;
        
        console.log('Timer started at:', this.startTime);
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.pausedTime = performance.now();
            this.isPaused = true;
            console.log('Timer paused at:', this.pausedTime);
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            const pauseDuration = performance.now() - this.pausedTime;
            this.totalPausedDuration += pauseDuration;
            this.isPaused = false;
            console.log('Timer resumed, pause duration:', pauseDuration);
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = false;
            console.log('Timer stopped');
        }
    }

    reset() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isPaused = false;
        this.isRunning = false;
        this.laps = [];
        this.lastUpdate = 0;
    }

    lap(label = '') {
        if (this.isRunning) {
            const lapTime = this.getElapsedTime();
            const lap = {
                time: lapTime,
                formatted: this.formatTime(lapTime),
                label: label,
                timestamp: performance.now()
            };
            this.laps.push(lap);
            console.log(`Lap ${this.laps.length}: ${lap.formatted} ${lap.label}`);
            return lap;
        }
        return null;
    }

    getElapsedTime() {
        if (!this.isRunning) return 0;
        
        const now = performance.now();
        let elapsed = now - this.startTime - this.totalPausedDuration;
        
        if (this.isPaused) {
            elapsed -= (now - this.pausedTime);
        }
        
        return Math.max(0, elapsed);
    }

    getRemainingTime(limit) {
        if (!limit) return 0;
        return Math.max(0, limit - this.getElapsedTime());
    }

    getFormattedTime(useMilliseconds = false) {
        return this.formatTime(this.getElapsedTime(), useMilliseconds);
    }

    getFormattedRemainingTime(limit, useMilliseconds = false) {
        return this.formatTime(this.getRemainingTime(limit), useMilliseconds);
    }

    formatTime(milliseconds, includeMilliseconds = false) {
        const totalMs = Math.max(0, milliseconds);
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const ms = Math.floor((totalMs % 1000) / this.precision);
        
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        const msStr = ms.toString().padStart(2, '0');
        
        if (includeMilliseconds) {
            return `${minutesStr}:${secondsStr}.${msStr}`;
        } else {
            return `${minutesStr}:${secondsStr}.${msStr}`;
        }
    }

    // Parse time string back to milliseconds
    parseTimeString(timeString) {
        const parts = timeString.split(':');
        if (parts.length !== 2) return 0;
        
        const minutes = parseInt(parts[0], 10) || 0;
        const secondsParts = parts[1].split('.');
        const seconds = parseInt(secondsParts[0], 10) || 0;
        const centiseconds = parseInt(secondsParts[1], 10) || 0;
        
        return (minutes * 60000) + (seconds * 1000) + (centiseconds * this.precision);
    }

    // Get timing statistics
    getStats() {
        const elapsed = this.getElapsedTime();
        return {
            elapsed: elapsed,
            formatted: this.formatTime(elapsed),
            totalPauses: this.totalPausedDuration,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            laps: this.laps.length,
            averageLapTime: this.laps.length > 0 ? 
                this.laps.reduce((sum, lap) => sum + lap.time, 0) / this.laps.length : 0,
            fastestLap: this.laps.length > 0 ? 
                Math.min(...this.laps.map(lap => lap.time)) : 0,
            slowestLap: this.laps.length > 0 ? 
                Math.max(...this.laps.map(lap => lap.time)) : 0
        };
    }

    // Performance-optimized update check
    shouldUpdate() {
        const now = performance.now();
        if (now - this.lastUpdate >= this.updateInterval) {
            this.lastUpdate = now;
            return true;
        }
        return false;
    }

    // Format for different display contexts
    getDisplayTime(format = 'standard') {
        const elapsed = this.getElapsedTime();
        
        switch (format) {
            case 'minimal': // MM:SS
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
            case 'precise': // MM:SS.mmm (with milliseconds)
                return this.formatTime(elapsed, true);
                
            case 'compact': // SSS.mm (total seconds with centiseconds)
                const totalSeconds = Math.floor(elapsed / 1000);
                const centis = Math.floor((elapsed % 1000) / 10);
                return `${totalSeconds}.${centis.toString().padStart(2, '0')}`;
                
            case 'standard': // MM:SS.cc (default)
            default:
                return this.formatTime(elapsed);
        }
    }

    // Export timer data
    export() {
        return {
            startTime: this.startTime,
            elapsed: this.getElapsedTime(),
            totalPaused: this.totalPausedDuration,
            laps: this.laps,
            stats: this.getStats(),
            exportTime: performance.now()
        };
    }

    // Import timer data (for replay/analysis)
    import(data) {
        if (data.startTime) {
            this.startTime = data.startTime;
            this.totalPausedDuration = data.totalPaused || 0;
            this.laps = data.laps || [];
            
            // Adjust start time to maintain elapsed time
            if (data.elapsed) {
                this.startTime = performance.now() - data.elapsed;
            }
        }
    }

    // Countdown timer functionality
    startCountdown(durationMs, onComplete = null, onTick = null) {
        this.countdownStart = performance.now();
        this.countdownDuration = durationMs;
        this.countdownComplete = onComplete;
        this.countdownTick = onTick;
        this.isCountdown = true;
        
        const updateCountdown = () => {
            if (!this.isCountdown) return;
            
            const elapsed = performance.now() - this.countdownStart;
            const remaining = Math.max(0, this.countdownDuration - elapsed);
            
            if (this.countdownTick) {
                this.countdownTick(remaining, this.formatTime(remaining));
            }
            
            if (remaining <= 0) {
                this.isCountdown = false;
                if (this.countdownComplete) {
                    this.countdownComplete();
                }
            } else {
                requestAnimationFrame(updateCountdown);
            }
        };
        
        requestAnimationFrame(updateCountdown);
    }

    stopCountdown() {
        this.isCountdown = false;
    }

    // Split timing for performance analysis
    split(name) {
        if (!this.isRunning) return null;
        
        const now = performance.now();
        const elapsed = this.getElapsedTime();
        
        const split = {
            name: name,
            time: elapsed,
            timestamp: now,
            formatted: this.formatTime(elapsed)
        };
        
        if (!this.splits) this.splits = [];
        this.splits.push(split);
        
        return split;
    }

    getSplits() {
        return this.splits || [];
    }

    clearSplits() {
        this.splits = [];
    }
}
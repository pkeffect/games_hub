// js/nameentry.js

export class NameEntry {
    constructor(score, time) {
        this.score = score;
        this.time = time;
        this.name = '';
        this.maxLength = 3;
        this.blinkTimer = 0;
    }

    handleInput(key) {
        if (key === 'Backspace') {
            this.name = this.name.slice(0, -1);
        } else if (key === 'Enter' || key === 'Space') {
            if (this.name.length > 0) {
                return this.name.toUpperCase().padEnd(3, '_');
            }
        } else if (key.length === 1 && this.name.length < this.maxLength) {
            // Only allow letters and numbers
            if (/[a-zA-Z0-9]/.test(key)) {
                this.name += key.toUpperCase();
            }
        }
        return null;
    }

    update() {
        this.blinkTimer += 0.1;
    }

    draw(ctx, width, height) {
        // Clear background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#00ff66';
        ctx.font = '32px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('NEW HIGH SCORE!', width / 2, 120);

        // Score display
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText(`SCORE: ${this.score}`, width / 2, 180);
        ctx.fillText(`TIME: ${this.time}`, width / 2, 220);

        // Name entry prompt
        ctx.fillStyle = '#00ffff';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('ENTER YOUR NAME:', width / 2, 280);

        // Name input field
        const nameDisplay = this.name.padEnd(3, '_');
        ctx.fillStyle = '#00ff66';
        ctx.font = '24px "Press Start 2P"';
        
        // Draw name with cursor
        for (let i = 0; i < 3; i++) {
            const x = width / 2 - 60 + (i * 40);
            const y = 320;
            
            if (i === this.name.length && Math.sin(this.blinkTimer) > 0) {
                // Blinking cursor
                ctx.fillStyle = '#00ff66';
                ctx.fillRect(x - 2, y - 24, 20, 30);
                ctx.fillStyle = '#000000';
            } else {
                ctx.fillStyle = '#00ff66';
            }
            
            ctx.textAlign = 'center';
            ctx.fillText(nameDisplay[i], x + 8, y);
        }

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('TYPE YOUR 3-CHARACTER NAME', width / 2, height - 80);
        ctx.fillText('PRESS ENTER WHEN FINISHED', width / 2, height - 60);
        ctx.fillText('PRESS BACKSPACE TO DELETE', width / 2, height - 40);
    }
}
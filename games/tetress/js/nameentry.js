// js/nameentry.js

import { MODE_CONFIGS } from './config.js';

export class NameEntry {
    constructor(score, lines, level, time, gameData = {}) {
        this.score = score;
        this.lines = lines;
        this.level = level;
        this.time = time;
        this.gameData = gameData;
        this.name = '';
        this.maxLength = 3;
        this.blinkTimer = 0;
        this.glowAnimation = 0;
        this.particles = [];
        this.showStats = false;
        this.statsAnimation = 0;
        
        this.initCelebrationParticles();
        
        console.log('NameEntry created with data:', { score, lines, level, time, gameData });
    }

    initCelebrationParticles() {
        // Create celebration particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * 800,
                y: Math.random() * 600 + 600, // Start below screen
                vx: (Math.random() - 0.5) * 8,
                vy: -(Math.random() * 10 + 5), // Upward velocity
                size: Math.random() * 4 + 2,
                color: ['#ff0080', '#00ffff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)],
                life: 1.0,
                decay: Math.random() * 0.01 + 0.005,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    handleInput(key) {
        if (key === 'Tab') {
            this.showStats = !this.showStats;
            return null;
        }
        
        if (key === 'Backspace') {
            this.name = this.name.slice(0, -1);
        } else if (key === 'Enter' || key === 'Space') {
            if (this.name.length > 0) {
                return this.name.toUpperCase().padEnd(3, '_');
            }
        } else if (key.length === 1 && this.name.length < this.maxLength) {
            if (/[a-zA-Z0-9]/.test(key)) {
                this.name += key.toUpperCase();
            }
        }
        return null;
    }

    update() {
        this.blinkTimer += 0.1;
        this.glowAnimation += 0.05;
        this.statsAnimation += 0.03;
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= particle.decay;
            particle.rotation += particle.rotationSpeed;
            
            // Bounce off sides
            if (particle.x < 0 || particle.x > 800) {
                particle.vx *= -0.8;
            }
            
            return particle.life > 0 && particle.y < 700;
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillStyle = particle.color;
            
            // Draw star shape
            const size = particle.size;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = ((i + 0.5) * Math.PI * 2) / 5;
                const innerX = Math.cos(innerAngle) * size * 0.5;
                const innerY = Math.sin(innerAngle) * size * 0.5;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    drawModeInfo(ctx, width) {
        if (!this.gameData.mode) return;
        
        const modeConfig = MODE_CONFIGS[this.gameData.mode];
        if (!modeConfig) return;
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${modeConfig.name.toUpperCase()} MODE`, width / 2, 110);
        
        // Mode-specific achievement text
        let achievementText = '';
        switch (this.gameData.mode) {
            case 'SPRINT':
                achievementText = `Completed in ${this.time}!`;
                break;
            case 'ULTRA':
                achievementText = `Maximum score in 2 minutes!`;
                break;
            case 'MARATHON':
                achievementText = `Reached level ${this.level}!`;
                break;
            case 'SURVIVAL':
                achievementText = `Survived the acceleration!`;
                break;
            case 'ZEN':
                achievementText = `Peaceful achievement!`;
                break;
        }
        
        if (achievementText) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '12px Orbitron, monospace';
            ctx.fillText(achievementText, width / 2, 130);
        }
    }

    drawDetailedStats(ctx, width, height) {
        if (!this.showStats || !this.gameData.stats) return;
        
        const statsBox = {
            x: 50,
            y: 200,
            width: width - 100,
            height: 250
        };
        
        // Stats background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(statsBox.x, statsBox.y, statsBox.width, statsBox.height);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(statsBox.x, statsBox.y, statsBox.width, statsBox.height);
        
        // Stats title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DETAILED STATISTICS', width / 2, statsBox.y + 25);
        
        // Stats content
        const stats = this.gameData.stats;
        const leftColumn = statsBox.x + 20;
        const rightColumn = statsBox.x + statsBox.width / 2 + 10;
        let leftY = statsBox.y + 50;
        let rightY = statsBox.y + 50;
        
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'left';
        
        // Left column - Line clears
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LINE CLEARS:', leftColumn, leftY);
        leftY += 20;
        
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`Single: ${stats.linesCleared.single}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Double: ${stats.linesCleared.double}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Triple: ${stats.linesCleared.triple}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Tetris: ${stats.linesCleared.tetris}`, leftColumn, leftY);
        leftY += 25;
        
        // T-spins
        ctx.fillStyle = '#ffffff';
        ctx.fillText('T-SPINS:', leftColumn, leftY);
        leftY += 20;
        
        ctx.fillStyle = '#ff00ff';
        ctx.fillText(`Mini: ${stats.tSpins.mini}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Single: ${stats.tSpins.single}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Double: ${stats.tSpins.double}`, leftColumn, leftY);
        leftY += 15;
        ctx.fillText(`Triple: ${stats.tSpins.triple}`, leftColumn, leftY);
        
        // Right column - Performance
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PERFORMANCE:', rightColumn, rightY);
        rightY += 20;
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`Max Combo: ${stats.maxCombo}`, rightColumn, rightY);
        rightY += 15;
        ctx.fillText(`Perfect Clears: ${stats.perfectClears}`, rightColumn, rightY);
        rightY += 15;
        ctx.fillText(`PPS: ${stats.pps}`, rightColumn, rightY);
        rightY += 25;
        
        // Efficiency
        const efficiency = this.lines > 0 ? (this.score / this.lines).toFixed(0) : 0;
        const accuracy = this.gameData.totalPieces > 0 ? 
            ((this.lines * 4) / this.gameData.totalPieces * 100).toFixed(1) : 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText('EFFICIENCY:', rightColumn, rightY);
        rightY += 20;
        
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`Score/Line: ${efficiency}`, rightColumn, rightY);
        rightY += 15;
        ctx.fillText(`Line Rate: ${accuracy}%`, rightColumn, rightY);
        rightY += 15;
        
        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '10px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS TAB TO TOGGLE STATS', width / 2, statsBox.y + statsBox.height - 10);
    }

    draw(ctx, width, height) {
        // Clear background with animated gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw celebration particles
        this.drawParticles(ctx);

        // Animated celebration title
        ctx.save();
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 20 + Math.sin(this.glowAnimation) * 10;
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 32px Orbitron, monospace';
        ctx.textAlign = 'center';
        
        // Bouncing animation
        const bounce = Math.abs(Math.sin(this.glowAnimation * 2)) * 5;
        ctx.fillText('NEW HIGH SCORE!', width / 2, 80 + bounce);
        ctx.restore();

        // Mode information
        this.drawModeInfo(ctx, width);

        // Score display box with enhanced styling
        const boxY = this.showStats ? 500 : 150;
        const gradient2 = ctx.createLinearGradient(0, boxY, 0, boxY + 120);
        gradient2.addColorStop(0, 'rgba(0, 255, 255, 0.15)');
        gradient2.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
        
        ctx.fillStyle = gradient2;
        ctx.fillRect(width / 2 - 140, boxY, 280, 120);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 140, boxY, 280, 120);

        // Score details with better formatting
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, width / 2, boxY + 30);
        
        ctx.font = '14px Orbitron, monospace';
        ctx.fillText(`LINES: ${this.lines}`, width / 2 - 60, boxY + 55);
        ctx.fillText(`LEVEL: ${this.level}`, width / 2 + 60, boxY + 55);
        ctx.fillText(`TIME: ${this.time}`, width / 2, boxY + 80);

        // Combo and other stats if available
        if (this.gameData.combo !== undefined) {
            ctx.fillText(`MAX COMBO: ${this.gameData.stats?.maxCombo || 0}`, width / 2, boxY + 100);
        }

        // Detailed statistics panel
        this.drawDetailedStats(ctx, width, height);

        // Name entry prompt with animation
        const promptY = this.showStats ? 470 : 290;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Orbitron, monospace';
        ctx.textAlign = 'center';
        
        const promptPulse = 0.8 + 0.2 * Math.sin(this.glowAnimation * 3);
        ctx.save();
        ctx.globalAlpha = promptPulse;
        ctx.fillText('ENTER YOUR NAME:', width / 2, promptY);
        ctx.restore();

        // Enhanced name input field
        const nameDisplay = this.name.padEnd(3, '_');
        const boxSize = 45;
        const startX = width / 2 - (3 * (boxSize + 5)) / 2;
        const inputY = promptY + 30;
        
        for (let i = 0; i < 3; i++) {
            const x = startX + (i * (boxSize + 5));
            
            // Input box with gradient
            const isActive = i === this.name.length;
            if (isActive && Math.sin(this.blinkTimer) > 0) {
                // Active/blinking cursor box
                const cursorGradient = ctx.createLinearGradient(x, inputY, x, inputY + boxSize);
                cursorGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                cursorGradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
                ctx.fillStyle = cursorGradient;
            } else {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            }
            ctx.fillRect(x, inputY, boxSize, boxSize);
            
            // Box border with glow
            ctx.strokeStyle = isActive ? '#00ffff' : '#666';
            ctx.lineWidth = isActive ? 3 : 2;
            if (isActive) {
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.strokeRect(x, inputY, boxSize, boxSize);
            ctx.shadowBlur = 0;
            
            // Character
            if (nameDisplay[i] !== '_') {
                ctx.fillStyle = '#00ff66';
                ctx.font = 'bold 28px Orbitron, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(nameDisplay[i], x + boxSize / 2, inputY + 32);
            }
        }

        // Enhanced instructions
        ctx.fillStyle = '#666';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'center';
        
        const instructY = height - 100;
        ctx.fillText('TYPE YOUR 3-CHARACTER NAME', width / 2, instructY);
        ctx.fillText('PRESS ENTER WHEN FINISHED', width / 2, instructY + 20);
        ctx.fillText('BACKSPACE TO DELETE • TAB FOR STATS', width / 2, instructY + 40);
        
        // Progress indicator
        const progress = this.name.length / 3;
        const progressWidth = 200;
        const progressX = (width - progressWidth) / 2;
        const progressY = instructY + 60;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(progressX, progressY, progressWidth, 4);
        
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(progressX, progressY, progressWidth * progress, 4);
    }
}
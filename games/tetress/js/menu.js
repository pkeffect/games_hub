// js/menu.js

import { MENU_OPTIONS, MODE_CONFIGS } from './config.js';

export class Menu {
    constructor() {
        this.selectedIndex = 0;
        this.inGameModeMenu = false;
        this.gameModeIndex = 0;
        this.glowAnimation = 0;
        this.descriptionAnimation = 0;
        this.particles = [];
        
        // Main menu options (simplified)
        this.mainOptions = [
            'PLAY GAME',
            'HIGH SCORES', 
            'SETTINGS'
        ];
        
        // Game mode submenu
        this.gameModes = [
            'MARATHON',
            'SPRINT', 
            'ULTRA',
            'ZEN',
            'SURVIVAL'
        ];
        
        // Initialize background particles
        this.initParticles();
    }

    initParticles() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.5 ? '#00ffff' : '#00ff66'
            });
        }
    }

    handleInput(key) {
        if (this.inGameModeMenu) {
            return this.handleGameModeInput(key);
        }
        
        switch (key) {
            case 'up':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                break;
            case 'down':
                this.selectedIndex = Math.min(this.mainOptions.length - 1, this.selectedIndex + 1);
                break;
            case 'select':
                return this.selectMainOption();
            case 'back':
                return null;
        }
        return null;
    }
    
    handleGameModeInput(key) {
        switch (key) {
            case 'up':
                this.gameModeIndex = Math.max(0, this.gameModeIndex - 1);
                break;
            case 'down':
                this.gameModeIndex = Math.min(this.gameModes.length - 1, this.gameModeIndex + 1);
                break;
            case 'select':
                const selectedMode = this.gameModes[this.gameModeIndex];
                this.inGameModeMenu = false;
                this.gameModeIndex = 0;
                return selectedMode;
            case 'back':
                this.inGameModeMenu = false;
                this.gameModeIndex = 0;
                break;
        }
        return null;
    }
    
    selectMainOption() {
        const option = this.mainOptions[this.selectedIndex];
        
        switch (option) {
            case 'PLAY GAME':
                this.inGameModeMenu = true;
                this.gameModeIndex = 0;
                return null;
            case 'HIGH SCORES':
                return 'HIGH SCORES';
            case 'SETTINGS':
                return 'SETTINGS';
        }
        return null;
    }

    getSelectedOption() {
        if (this.inGameModeMenu) {
            return this.gameModes[this.gameModeIndex];
        }
        return this.mainOptions[this.selectedIndex];
    }

    update() {
        this.glowAnimation += 0.03;
        this.descriptionAnimation += 0.02;
        
        // Update background particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = 800;
            if (particle.x > 800) particle.x = 0;
            if (particle.y < 0) particle.y = 600;
            if (particle.y > 600) particle.y = 0;
            
            // Gentle floating motion
            particle.vx += (Math.random() - 0.5) * 0.005;
            particle.vy += (Math.random() - 0.5) * 0.005;
            
            // Limit velocity
            particle.vx = Math.max(-0.5, Math.min(0.5, particle.vx));
            particle.vy = Math.max(-0.5, Math.min(0.5, particle.vy));
        });
    }

    drawBackgroundParticles(ctx, width, height) {
        ctx.save();
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.opacity * (0.5 + 0.3 * Math.sin(this.glowAnimation * 2 + particle.x * 0.01));
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawTitle(ctx, width) {
        // Animated title with enhanced effects
        ctx.save();
        const titlePulse = Math.sin(this.glowAnimation) * 0.2 + 0.8;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15 + Math.sin(this.glowAnimation * 2) * 5;
        
        // Main title
        ctx.fillStyle = `rgba(0, 255, 255, ${titlePulse})`;
        ctx.font = 'bold 42px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TETRESS', width / 2, 120);
        
        // Title reflection effect
        ctx.save();
        ctx.scale(1, -0.2);
        ctx.globalAlpha = 0.15;
        ctx.fillText('TETRESS', width / 2, -130);
        ctx.restore();
        
        ctx.restore();

        // Enhanced subtitle 
        const subtitle = 'FUTURISTIC EDITION';
        ctx.fillStyle = '#00ff66';
        ctx.font = '14px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(subtitle, width / 2, 150);
    }

    drawMainMenu(ctx, width, height) {
        const startY = 200;
        const lineHeight = 50;

        this.mainOptions.forEach((option, index) => {
            const y = startY + (index * lineHeight);
            const isSelected = index === this.selectedIndex;

            // Selection background
            if (isSelected) {
                const pulse = Math.sin(this.glowAnimation * 3) * 0.1 + 0.9;
                const selectionWidth = 240;
                const selectionHeight = 40;
                
                ctx.save();
                ctx.globalAlpha = 0.2 * pulse;
                const selGradient = ctx.createLinearGradient(
                    width / 2 - selectionWidth / 2, y - selectionHeight / 2,
                    width / 2 + selectionWidth / 2, y + selectionHeight / 2
                );
                selGradient.addColorStop(0, '#00ffff');
                selGradient.addColorStop(0.5, '#ffffff');
                selGradient.addColorStop(1, '#00ffff');
                ctx.fillStyle = selGradient;
                ctx.fillRect(width / 2 - selectionWidth / 2, y - selectionHeight / 2, selectionWidth, selectionHeight);
                ctx.restore();
                
                // Selection border
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.strokeRect(width / 2 - selectionWidth / 2, y - selectionHeight / 2, selectionWidth, selectionHeight);
                ctx.shadowBlur = 0;
                
                // Text glow
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 0;
            }

            // Option text
            ctx.font = 'bold 18px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(option, width / 2, y + 5);
        });
        
        // Show arrow for Play Game
        if (this.selectedIndex === 0) {
            ctx.fillStyle = '#00ff66';
            ctx.font = '12px Orbitron, monospace';
            ctx.textAlign = 'center';
            const arrowPulse = 0.7 + 0.3 * Math.sin(this.glowAnimation * 4);
            ctx.globalAlpha = arrowPulse;
            ctx.fillText('→ Choose Game Mode', width / 2, startY + 25);
            ctx.globalAlpha = 1;
        }
    }

    drawGameModeMenu(ctx, width, height) {
        // Draw darkened background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        // Game mode selection title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT GAME MODE', width / 2, 140);

        const startY = 180;
        const lineHeight = 45;

        this.gameModes.forEach((mode, index) => {
            const y = startY + (index * lineHeight);
            const isSelected = index === this.gameModeIndex;
            const config = MODE_CONFIGS[mode];

            // Selection background
            if (isSelected) {
                const pulse = Math.sin(this.glowAnimation * 3) * 0.1 + 0.9;
                const selectionWidth = 320;
                const selectionHeight = 35;
                
                ctx.save();
                ctx.globalAlpha = 0.25 * pulse;
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(width / 2 - selectionWidth / 2, y - selectionHeight / 2, selectionWidth, selectionHeight);
                ctx.restore();
                
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(width / 2 - selectionWidth / 2, y - selectionHeight / 2, selectionWidth, selectionHeight);
                
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = '#cccccc';
                ctx.shadowBlur = 0;
            }

            // Mode name
            ctx.font = 'bold 16px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(mode, width / 2, y + 5);
            
            // Mode description for selected item
            if (isSelected && config) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '11px Orbitron, monospace';
                ctx.shadowBlur = 0;
                
                const descAlpha = 0.6 + 0.4 * Math.sin(this.descriptionAnimation);
                ctx.globalAlpha = descAlpha;
                ctx.fillText(config.description, width / 2, y + 20);
                ctx.globalAlpha = 1;
            }
        });
        
        // Instructions
        ctx.fillStyle = '#999';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('↑↓ NAVIGATE  ENTER SELECT  ESC BACK', width / 2, height - 80);
    }

    draw(ctx, width, height) {
        // Clear background with animated gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const time = this.glowAnimation * 0.3;
        gradient.addColorStop(0, `hsl(${180 + Math.sin(time) * 20}, 15%, ${3 + Math.sin(time) * 2}%)`);
        gradient.addColorStop(1, `hsl(${210 + Math.cos(time) * 20}, 20%, ${6 + Math.cos(time) * 2}%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw background particles
        this.drawBackgroundParticles(ctx, width, height);

        // Draw title
        this.drawTitle(ctx, width);

        // Draw appropriate menu
        if (this.inGameModeMenu) {
            this.drawGameModeMenu(ctx, width, height);
        } else {
            this.drawMainMenu(ctx, width, height);
            
            // Enhanced instructions
            ctx.fillStyle = '#666';
            ctx.font = '11px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            
            const instructionY = height - 100;
            ctx.fillText('↑↓ NAVIGATE', width / 2, instructionY);
            ctx.fillText('ENTER SELECT', width / 2, instructionY + 15);
            
            // Version and credits
            ctx.fillStyle = '#333';
            ctx.font = '9px Orbitron, monospace';
            ctx.textAlign = 'right';
            ctx.fillText('Enhanced v2.1', width - 10, height - 20);
            ctx.textAlign = 'left';
            ctx.fillText('Modern Tetris Experience', 10, height - 20);
        }
    }
}
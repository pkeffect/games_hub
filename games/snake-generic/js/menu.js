// js/menu.js

import { MENU_OPTIONS } from './config.js';

export class Menu {
    constructor() {
        this.selectedIndex = 0;
        this.options = MENU_OPTIONS;
    }

    handleInput(key) {
        switch (key) {
            case 'ArrowUp':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                break;
            case 'ArrowDown':
                this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
                break;
            case 'Space':
            case 'Enter':
                return this.getSelectedOption();
        }
        return null;
    }

    getSelectedOption() {
        return this.options[this.selectedIndex];
    }

    draw(ctx, width, height) {
        // Clear background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#00ff66';
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', width / 2, 120);

        // Subtitle
        ctx.fillStyle = '#00ffff';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('FUTURISTIC EDITION', width / 2, 160);

        // Menu options
        const startY = 240;
        const lineHeight = 50;

        this.options.forEach((option, index) => {
            const y = startY + (index * lineHeight);
            const isSelected = index === this.selectedIndex;

            if (isSelected) {
                // Highlight selected option
                ctx.fillStyle = '#00ff66';
                ctx.fillRect(width / 2 - 150, y - 30, 300, 40);
                ctx.fillStyle = '#000000';
            } else {
                ctx.fillStyle = '#ffffff';
            }

            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(option, width / 2, y);
        });

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('USE ARROW KEYS TO NAVIGATE', width / 2, height - 60);
        ctx.fillText('PRESS SPACE OR ENTER TO SELECT', width / 2, height - 40);
    }
}
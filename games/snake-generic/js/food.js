// js/food.js

import { GRID_SIZE } from './config.js';

export default class Food {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.position = { x: 0, y: 0 };
        this.pulseAnimation = 0;
    }

    draw() {
        this.pulseAnimation += 0.12;
        const pulse = Math.sin(this.pulseAnimation) * 0.1 + 1;
        const size = GRID_SIZE * pulse;
        
        const x = this.position.x * GRID_SIZE + (GRID_SIZE - size) / 2;
        const y = this.position.y * GRID_SIZE + (GRID_SIZE - size) / 2;
        
        // Main food square - solid green
        this.ctx.fillStyle = '#00ff66';
        this.ctx.fillRect(x, y, size, size);
        
        // Inner bright square for depth
        const innerSize = size * 0.6;
        const innerX = x + (size - innerSize) / 2;
        const innerY = y + (size - innerSize) / 2;
        
        this.ctx.fillStyle = '#66ff99';
        this.ctx.fillRect(innerX, innerY, innerSize, innerSize);
        
        // Bright center square
        const centerSize = size * 0.3;
        const centerX = x + (size - centerSize) / 2;
        const centerY = y + (size - centerSize) / 2;
        
        this.ctx.fillStyle = '#ccffdd';
        this.ctx.fillRect(centerX, centerY, centerSize, centerSize);
    }
    
    generateNewPosition(snakeBody) {
        const tileCountX = this.canvasWidth / GRID_SIZE;
        const tileCountY = this.canvasHeight / GRID_SIZE;

        while (true) {
            this.position = {
                x: Math.floor(Math.random() * tileCountX),
                y: Math.floor(Math.random() * tileCountY)
            };
            
            const onSnake = snakeBody.some(
                segment => segment.x === this.position.x && segment.y === this.position.y
            );
            
            if (!onSnake) {
                break;
            }
        }
    }
}
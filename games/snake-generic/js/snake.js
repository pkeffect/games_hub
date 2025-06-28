// js/snake.js

import { GRID_SIZE, COLOR_PALETTE, COLOR_TRANSITION_LENGTH } from './config.js';

export default class Snake {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.colorPalette = COLOR_PALETTE;
        this.colorTransitionLength = COLOR_TRANSITION_LENGTH;
        this.reset();
    }

    // Helper function to interpolate between two hex colors
    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Calculates the color for a segment based on its position in the snake's body
    getColorForSegment(index) {
        const totalIndex = Math.floor(index / this.colorTransitionLength);
        const color1 = this.colorPalette[totalIndex % this.colorPalette.length];
        const color2 = this.colorPalette[(totalIndex + 1) % this.colorPalette.length];
        const factor = (index % this.colorTransitionLength) / this.colorTransitionLength;
        return this.interpolateColor(color1, color2, factor);
    }
    
    reset() {
        const startX = Math.floor(this.canvasWidth / GRID_SIZE / 2);
        const startY = Math.floor(this.canvasHeight / GRID_SIZE / 2);
        
        // The body now stores {x, y, color} for each segment
        this.body = [{ 
            x: startX, 
            y: startY,
            color: this.getColorForSegment(0)
        }];
        
        this.direction = 'right';
        this.isChangingDirection = false;
    }

    draw() {
        this.body.forEach((segment) => {
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;
            
            // Draw crisp square segments
            this.ctx.fillStyle = segment.color;
            this.ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
        });
    }

    move() {
        const currentHead = this.body[0];
        const newHead = { x: currentHead.x, y: currentHead.y };

        switch (this.direction) {
            case 'up': newHead.y -= 1; break;
            case 'down': newHead.y += 1; break;
            case 'left': newHead.x -= 1; break;
            case 'right': newHead.x += 1; break;
        }

        // Calculate the new head's color based on the snake's upcoming length
        newHead.color = this.getColorForSegment(this.body.length);
        
        this.body.unshift(newHead); // Add new head
        this.isChangingDirection = false;
    }

    grow() {
        // This method is now a placeholder, growth is handled by not shrinking
    }

    shrink() {
        this.body.pop();
    }

    changeDirection(newDirection) {
        if (this.isChangingDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[this.direction] !== newDirection) {
            this.direction = newDirection;
            this.isChangingDirection = true;
        }
    }

    checkCollision() {
        const head = this.body[0];
        const tileCountX = this.canvasWidth / GRID_SIZE;
        const tileCountY = this.canvasHeight / GRID_SIZE;

        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            return true;
        }

        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
}
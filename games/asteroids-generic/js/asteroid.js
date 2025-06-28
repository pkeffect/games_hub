// js/asteroid.js
import { CONFIG } from './config.js';

export class Asteroid {
    constructor(x, y, size = 'large', level = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.level = level;
        
        // Set radius based on size
        switch (size) {
            case 'large':
                this.radius = CONFIG.ASTEROID_LARGE_RADIUS;
                this.points = CONFIG.ASTEROID_LARGE_POINTS;
                break;
            case 'medium':
                this.radius = CONFIG.ASTEROID_MEDIUM_RADIUS;
                this.points = CONFIG.ASTEROID_MEDIUM_POINTS;
                break;
            case 'small':
                this.radius = CONFIG.ASTEROID_SMALL_RADIUS;
                this.points = CONFIG.ASTEROID_SMALL_POINTS;
                break;
        }
        
        // Calculate speed based on level and size
        const baseSpeed = CONFIG.ASTEROID_BASE_SPEED + (level * CONFIG.LEVEL_SPEED_INCREASE);
        const sizeSpeedModifier = size === 'small' ? 1.5 : size === 'medium' ? 1.2 : 1.0;
        const speed = baseSpeed * sizeSpeedModifier;
        
        // Random velocity with some variation
        const angle = Math.random() * Math.PI * 2;
        const speedVariation = (Math.random() - 0.5) * CONFIG.ASTEROID_SPEED_VARIATION;
        const finalSpeed = speed + speedVariation;
        
        this.vel = {
            x: Math.cos(angle) * finalSpeed,
            y: Math.sin(angle) * finalSpeed
        };
        
        // Add rotation with more variation for better visibility
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * CONFIG.ASTEROID_ROTATION_SPEED * 2; // Double the range
        
        // Ensure minimum rotation speed for visibility
        if (Math.abs(this.rotationSpeed) < CONFIG.ASTEROID_ROTATION_SPEED * 0.3) {
            this.rotationSpeed = this.rotationSpeed >= 0 ? 
                CONFIG.ASTEROID_ROTATION_SPEED * 0.3 : 
                -CONFIG.ASTEROID_ROTATION_SPEED * 0.3;
        }
        
        // Generate random vertices for irregular shape with enhanced variation
        this.vertices = [];
        for (let i = 0; i < CONFIG.ASTEROID_VERTICES; i++) {
            // Create more pronounced variations to make rotation more visible
            let variation = Math.random() * CONFIG.ASTEROID_JAG * 2 + 1 - CONFIG.ASTEROID_JAG;
            
            // Add some vertices that stick out more to make rotation obvious
            if (i % 3 === 0) {
                variation *= 1.3; // Make every 3rd vertex more pronounced
            }
            
            this.vertices.push(variation);
        }
    }

    update() {
        // Apply velocity to position
        this.x += this.vel.x;
        this.y += this.vel.y;
        
        // Apply rotation
        this.rotation += this.rotationSpeed;

        // Handle screen wrap
        if (this.x < 0 - this.radius) this.x = CONFIG.CANVAS_WIDTH + this.radius;
        if (this.x > CONFIG.CANVAS_WIDTH + this.radius) this.x = 0 - this.radius;
        if (this.y < 0 - this.radius) this.y = CONFIG.CANVAS_HEIGHT + this.radius;
        if (this.y > CONFIG.CANVAS_HEIGHT + this.radius) this.y = 0 - this.radius;
    }

    // Create smaller asteroids when this one is destroyed
    split() {
        const fragments = [];
        
        if (this.size === 'large') {
            // Large asteroid splits into 2 medium asteroids
            for (let i = 0; i < 2; i++) {
                const angle = (Math.PI * 2 / 2) * i + Math.random() * 0.5; // Some randomization
                const distance = this.radius * 0.7; // Separate them
                const newX = this.x + Math.cos(angle) * distance;
                const newY = this.y + Math.sin(angle) * distance;
                fragments.push(new Asteroid(newX, newY, 'medium', this.level));
            }
        } else if (this.size === 'medium') {
            // Medium asteroid splits into 2 small asteroids
            for (let i = 0; i < 2; i++) {
                const angle = (Math.PI * 2 / 2) * i + Math.random() * 0.5;
                const distance = this.radius * 0.8;
                const newX = this.x + Math.cos(angle) * distance;
                const newY = this.y + Math.sin(angle) * distance;
                fragments.push(new Asteroid(newX, newY, 'small', this.level));
            }
        }
        // Small asteroids don't split further
        
        return fragments;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < CONFIG.ASTEROID_VERTICES; i++) {
            const angle = (Math.PI * 2 / CONFIG.ASTEROID_VERTICES) * i;
            const r = this.radius * this.vertices[i];
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // Static method to create asteroids safely positioned away from player
    static createSafeAsteroid(playerX, playerY, canvasWidth, canvasHeight, size = 'large', level = 1, existingAsteroids = []) {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            let x, y;
            
            // Spawn from edges or corners
            const edge = Math.floor(Math.random() * 4);
            switch (edge) {
                case 0: // Top
                    x = Math.random() * canvasWidth;
                    y = -CONFIG.ASTEROID_LARGE_RADIUS;
                    break;
                case 1: // Right
                    x = canvasWidth + CONFIG.ASTEROID_LARGE_RADIUS;
                    y = Math.random() * canvasHeight;
                    break;
                case 2: // Bottom
                    x = Math.random() * canvasWidth;
                    y = canvasHeight + CONFIG.ASTEROID_LARGE_RADIUS;
                    break;
                case 3: // Left
                    x = -CONFIG.ASTEROID_LARGE_RADIUS;
                    y = Math.random() * canvasHeight;
                    break;
            }
            
            // Check distance from player
            const distFromPlayer = Math.hypot(x - playerX, y - playerY);
            const minSafeDistance = 150;
            
            if (distFromPlayer > minSafeDistance) {
                // Check distance from other asteroids
                let isSafe = true;
                for (const asteroid of existingAsteroids) {
                    const distFromAsteroid = Math.hypot(x - asteroid.x, y - asteroid.y);
                    if (distFromAsteroid < CONFIG.ASTEROID_LARGE_RADIUS * 2.5) {
                        isSafe = false;
                        break;
                    }
                }
                
                if (isSafe) {
                    return new Asteroid(x, y, size, level);
                }
            }
            
            attempts++;
        }
        
        // Fallback: create at a safe default position
        return new Asteroid(-CONFIG.ASTEROID_LARGE_RADIUS, canvasHeight / 2, size, level);
    }
}
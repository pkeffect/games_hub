// js/ufo.js
import { CONFIG } from './config.js';
import { Bullet } from './bullet.js';

export class UFO {
    constructor(isSmall = false) {
        // Spawn from left or right edge
        this.x = Math.random() < 0.5 ? -30 : CONFIG.CANVAS_WIDTH + 30;
        this.y = Math.random() * (CONFIG.CANVAS_HEIGHT * 0.8) + (CONFIG.CANVAS_HEIGHT * 0.1); // Stay away from very top/bottom
        
        this.isSmall = isSmall;
        this.radius = isSmall ? 12 : 25;
        
        // Movement
        this.vel = { 
            x: (this.x < 0 ? 1 : -1) * CONFIG.UFO_SPEED, 
            y: (Math.random() - 0.5) * 0.5 // Slight vertical drift
        };
        
        // Shooting
        this.shootCooldown = 60 + Math.random() * 60; // Initial delay
        this.maxShootCooldown = isSmall ? 90 : 150; // Small UFOs shoot more frequently
        
        // Behavior
        this.changeDirectionTimer = 120 + Math.random() * 120;
        this.maxChangeTimer = 180;
    }
    
    update(player, bullets) {
        // Movement
        this.x += this.vel.x;
        this.y += this.vel.y;
        
        // Occasional direction changes for more interesting movement
        this.changeDirectionTimer--;
        if (this.changeDirectionTimer <= 0) {
            this.vel.y = (Math.random() - 0.5) * 0.8;
            this.changeDirectionTimer = this.maxChangeTimer + Math.random() * this.maxChangeTimer;
        }
        
        // Keep UFO within reasonable bounds
        if (this.y < 50) this.vel.y = Math.abs(this.vel.y);
        if (this.y > CONFIG.CANVAS_HEIGHT - 50) this.vel.y = -Math.abs(this.vel.y);
        
        // Shooting logic
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        } else {
            this.shoot(player, bullets);
            this.shootCooldown = this.maxShootCooldown + Math.random() * this.maxShootCooldown * 0.5;
        }
    }
    
    shoot(player, bullets) {
        let angle;
        
        if (this.isSmall && player && !player.isDestroyed) {
            // Small UFO aims at player with some inaccuracy
            const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
            const inaccuracy = (Math.random() - 0.5) * 0.3; // Slight inaccuracy
            angle = targetAngle + inaccuracy;
        } else if (!this.isSmall && player && !player.isDestroyed) {
            // Large UFO has poor aim but still somewhat targets player
            const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
            const inaccuracy = (Math.random() - 0.5) * 1.0; // Much more inaccuracy
            angle = targetAngle + inaccuracy;
        } else {
            // No player target - shoot randomly
            angle = Math.random() * 2 * Math.PI;
        }
        
        bullets.push(new Bullet(this.x, this.y, angle, CONFIG.UFO_BULLET_SPEED, 'UFO'));
    }
    
    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (this.isSmall) {
            // Small UFO - more detailed
            // Main saucer body
            ctx.moveTo(this.x - this.radius, this.y);
            ctx.lineTo(this.x + this.radius, this.y);
            
            // Top dome
            ctx.moveTo(this.x - this.radius * 0.6, this.y - this.radius * 0.4);
            ctx.lineTo(this.x + this.radius * 0.6, this.y - this.radius * 0.4);
            ctx.arc(this.x, this.y - this.radius * 0.4, this.radius * 0.6, 0, Math.PI, true);
            
            // Bottom section
            ctx.moveTo(this.x - this.radius, this.y);
            ctx.arc(this.x, this.y, this.radius, Math.PI, 2 * Math.PI);
            
            // Details
            ctx.moveTo(this.x - this.radius * 0.3, this.y);
            ctx.lineTo(this.x + this.radius * 0.3, this.y);
        } else {
            // Large UFO - simpler design
            // Main saucer body
            ctx.moveTo(this.x - this.radius, this.y);
            ctx.lineTo(this.x + this.radius, this.y);
            
            // Top section
            ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius * 0.3);
            ctx.lineTo(this.x + this.radius * 0.5, this.y - this.radius * 0.3);
            
            // Curved sections
            ctx.moveTo(this.x - this.radius, this.y);
            ctx.arc(this.x, this.y, this.radius, Math.PI, 2 * Math.PI);
            
            ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius * 0.3);
            ctx.arc(this.x, this.y - this.radius * 0.3, this.radius * 0.5, Math.PI, 2 * Math.PI);
        }
        
        ctx.stroke();
        ctx.restore();
    }
}
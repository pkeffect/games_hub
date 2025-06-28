// js/bullet.js
import { CONFIG } from './config.js';
export class Bullet {
    constructor(x, y, angle, speed, owner = 'PLAYER') {
        this.x = x; this.y = y; this.radius = 2;
        this.vel = { x: speed * Math.cos(angle), y: -speed * Math.sin(angle) };
        this.lifespan = 80; this.owner = owner;
    }
    update() { this.x += this.vel.x; this.y += this.vel.y; this.lifespan--; }
    draw(ctx) {
        ctx.fillStyle = 'white'; ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}
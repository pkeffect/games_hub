// js/player.js
import { CONFIG } from './config.js';

class GameObject {
    constructor(x, y, radius) { this.x = x; this.y = y; this.radius = radius; }
    handleScreenWrap() {
        if (this.x < 0) this.x = CONFIG.CANVAS_WIDTH; if (this.x > CONFIG.CANVAS_WIDTH) this.x = 0;
        if (this.y < 0) this.y = CONFIG.CANVAS_HEIGHT; if (this.y > CONFIG.CANVAS_HEIGHT) this.y = 0;
    }
}

export class Particle {
    constructor(x, y, vel, lifespan, radius) {
        this.x = x; this.y = y; this.vel = vel;
        this.lifespan = lifespan; this.radius = radius;
    }
    update() { this.x += this.vel.x; this.y += this.vel.y; this.lifespan--; }
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.lifespan / 60})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}

export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER_SIZE / 2);
        this.angle = Math.PI / 2; this.vel = { x: 0, y: 0 }; this.rotation = 0;
        this.isThrusting = false; this.isDestroyed = false;
        this.hyperspaceCooldown = 0;
    }

    getVertices() {
        const noseX = this.x + this.radius * Math.cos(this.angle);
        const noseY = this.y - this.radius * Math.sin(this.angle);
        const leftX = this.x - this.radius * (Math.cos(this.angle) + Math.sin(this.angle));
        const leftY = this.y + this.radius * (Math.sin(this.angle) - Math.cos(this.angle));
        const rightX = this.x - this.radius * (Math.cos(this.angle) - Math.sin(this.angle));
        const rightY = this.y + this.radius * (Math.sin(this.angle) + Math.cos(this.angle));
        return [{x: noseX, y: noseY}, {x: leftX, y: leftY}, {x: rightX, y: rightY}];
    }

    createExplosion() {
        const particles = [];
        const vertices = this.getVertices();
        // Create particles from the ship's lines
        for (let i = 0; i < vertices.length; i++) {
            const start = vertices[i];
            const end = vertices[(i + 1) % vertices.length];
            const segmentAngle = Math.atan2(end.y - start.y, end.x - start.x);
            const particleVel = { x: Math.cos(segmentAngle) * 1.5, y: Math.sin(segmentAngle) * 1.5 };
            particles.push(new Particle(this.x, this.y, particleVel, 60, 1.5));
        }
        return particles;
    }

    hyperspace() {
        if (this.hyperspaceCooldown > 0) return;
        this.x = Math.random() * CONFIG.CANVAS_WIDTH;
        this.y = Math.random() * CONFIG.CANVAS_HEIGHT;
        this.vel = { x: 0, y: 0 };
        this.hyperspaceCooldown = CONFIG.HYPERSPACE_COOLDOWN;
    }

    rotate() { this.angle += this.rotation; }
    thrust() {
        if (this.isThrusting) {
            this.vel.x += CONFIG.PLAYER_THRUST * Math.cos(this.angle);
            this.vel.y -= CONFIG.PLAYER_THRUST * Math.sin(this.angle);
        }
        this.vel.x *= CONFIG.FRICTION;
        this.vel.y *= CONFIG.FRICTION;
    }

    update() {
        if (this.hyperspaceCooldown > 0) this.hyperspaceCooldown--;
        this.rotate(); this.thrust();
        this.x += this.vel.x; this.y += this.vel.y;
        this.handleScreenWrap();
    }

    draw(ctx) {
        const vertices = this.getVertices();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.closePath(); ctx.stroke();
        if (this.isThrusting) {
            ctx.fillStyle = 'red'; ctx.beginPath();
            ctx.moveTo(this.x - this.radius * (1.2 * Math.cos(this.angle) + 0.75 * Math.sin(this.angle)), this.y + this.radius * (1.2 * Math.sin(this.angle) - 0.75 * Math.cos(this.angle)));
            ctx.lineTo(this.x - this.radius * 2.7 * Math.cos(this.angle), this.y + this.radius * 2.7 * Math.sin(this.angle));
            ctx.lineTo(this.x - this.radius * (1.2 * Math.cos(this.angle) - 0.75 * Math.sin(this.angle)), this.y + this.radius * (1.2 * Math.sin(this.angle) + 0.75 * Math.cos(this.angle)));
            ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = 'blue'; ctx.fillRect(vertices[0].x - 1, vertices[0].y - 1, 2, 2);
    }
}
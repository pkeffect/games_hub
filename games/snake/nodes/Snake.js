import { BABY_SNAKE_SIZE } from './../config/global.js';

export default class Snake {
    constructor({ canvas, ctx, scale }) {
        this.position = { x: 0, y: canvas.height / 2 - scale };

        this.velocity = {
            x: scale * 1,
            y: 0
        };

        this.ctx = ctx;
        this.canvas = canvas;
        this.scale = scale;
        this.total = BABY_SNAKE_SIZE;
        this.tail = [];
        this.moved = true;
    }

    initiate() {
        for (let i = 0; i < this.total; i++) {
            this.tail[i] = { x: null, y: null };
        }
    }

    draw(x = this.position.x, y = this.position.y, w = this.scale, h = this.scale) {
        this.ctx.fillStyle = '#212519';
        this.ctx.strokeStyle = '#7b9348';

        for (let i = 0; i < this.tail.length; i++) {
            this.ctx.fillRect(this.tail[i].x, this.tail[i].y, w, h);
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.tail[i].x, this.tail[i].y, w, h);
        }

        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeRect(x, y, w, h);
    }

    update() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }

        this.tail[this.total - 1] = { x: this.position.x, y: this.position.y };

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.xEnd > this.canvas.width)  this.position.x = 0;
        if (this.position.x < 0) this.position.x = this.canvas.width - this.scale;
        if (this.yEnd > this.canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = this.canvas.height - this.scale;

        this.moved = true;
    }

    changeDirection(dir) {
        if(this.moved) {
            switch (dir) {
            case 'Up':
                if (this.velocity.y !== this.scale) {
                    this.velocity.x = 0;
                    this.velocity.y = -this.scale;
                }
                break;
            case 'Down':
                if (this.velocity.y !== -this.scale) {
                    this.velocity.x = 0;
                    this.velocity.y = this.scale;
                }
                break;
            case 'Left':
                if (this.velocity.x !== this.scale) {
                    this.velocity.x = -this.scale;
                    this.velocity.y = 0;
                }
                break;
            case 'Right':
                if (this.velocity.x !== -this.scale) {
                    this.velocity.x = this.scale;
                    this.velocity.y = 0;
                }
                break;
            }
        }

        this.moved = false;
    }

    grow() {
        this.total++;
    }

    collide() {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.position.x === this.tail[i].x && this.position.y === this.tail[i].y) {
                this.total = BABY_SNAKE_SIZE;
                this.tail = [];
                this.initiate();
                return true;
            }
        }
    }

    get xEnd() {
        return this.position.x + this.scale;
    }

    get yEnd() {
        return this.position.y + this.scale;
    }
}

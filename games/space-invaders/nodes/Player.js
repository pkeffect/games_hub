import { BASE_PADDING } from '../config/global.js';

export default class Player {
    position;
    velocity;
    width;
    height;
    beams = [];

    constructor() {
        this.velocity = { x: 0, y: 0 };

        const image = new Image();
        image.src = './assets/images/player.png';

        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
            this.position = { x: (window.innerWidth / 2) - (this.width / 2), y: window.innerHeight - this.height - BASE_PADDING };
        };
    }

    draw(ctx) {
        if(!this.image) return;
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update(ctx) {
        if(!this.position?.x || !this.position?.y) return;
        this.draw(ctx);
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    resetPosition() {
        this.position = { x: (window.innerWidth / 2) - (this.width / 2), y: window.innerHeight - this.height - BASE_PADDING };
    }

    resetVelocity() {
        this.velocity = { x: 0, y: 0 };
    }

    reset() {
        this.resetPosition();
        this.resetVelocity();
    }

    get left () {
        return this.position?.x;
    }

    get right () {
        return this.position?.x + this.width;
    }

    get top () {
        return this.position?.y;
    }

    get bottom () {
        return this.position?.y + this.height;
    }
}

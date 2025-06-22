export default class Enemy {
    score = 10;
    attackDelay = 1;

    constructor({ position, velocity, attackDelay }) {
        this.position = position;
        this.velocity = velocity;
        this.attackDelay = attackDelay || this.attackDelay;

        const image = new Image();
        image.src = './assets/images/monster-1.png';

        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
        };
    }

    draw(ctx) {
        if(!this.image) return;
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update(ctx) {
        if(!this.image) return;

        this.draw(ctx);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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
        if(!this.position) return 0;
        return this.position?.y + this.height;
    }
}

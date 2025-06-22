export default class Projectile {
    position;
    velocity;
    width;
    height;

    constructor({ position, velocity, color }) {
        this.position = { x: position.x, y: position.y };
        this.velocity = velocity || { x: 0, y: -10 };
        this.color = color || 'white';

        this.width = 3;
        this.height = 10;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(ctx) {
        this.draw(ctx);
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
        return this.position?.y + this.height;
    }
}

import { getRandomFromRange } from './../../utilities/numbers.js';
import { generateRandomColor } from './../../utilities/colors.js';

export default class Particle {
    defaultPosition = { x: getRandomFromRange(0, window.innerWidth), y: getRandomFromRange(0, window.innerHeight) };

    constructor(position) {
        this.position = position || this.defaultPosition;
        this.velocity = { x: 0, y: getRandomFromRange(1, 2) };
        this.radius = getRandomFromRange(1, 2);
    }

    draw(ctx) {
        ctx.fillStyle = generateRandomColor();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update(ctx) {
        this.draw(ctx);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

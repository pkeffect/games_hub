import { drawHatchedRoundRect } from '../../utilities/canvas.js';

const types = {
    NORMAL: 'NORMAL',
    MOVING: 'MOVING',
    FRAGILE: 'FRAGILE',
};

// const typeColors = {
//     NORMAL: 'black',
//     MOVING: 'red',
//     FRAGILE: 'blue',
// };

// get colors from css variables
const blue = getComputedStyle(document.documentElement).getPropertyValue('--c-ink');
const red = getComputedStyle(document.documentElement).getPropertyValue('--c-red-ink');
const green = getComputedStyle(document.documentElement).getPropertyValue('--c-green');

export default class Platform {

    constructor({ position, type = types.NORMAL, width = 100, height = 20 }) {
        this.position = position;
        this.type = type;
        this.width = width;
        this.height = height;
        this.velocity = { x: type === types.MOVING ? 1 : 0, y: 0 };
        this.isMoving = type === types.MOVING;
    }

    draw(ctx) {
        const type = this.type;

        switch(type) {
        case types.NORMAL:
            drawHatchedRoundRect({ ctx, position: this.position, width: this.width, height: this.height, radius: 3, color: green, spacing: 4, hasStroke: true, type: 'horizontal' });
            break;
        case types.MOVING:
            drawHatchedRoundRect({ ctx, position: this.position, width: this.width, height: this.height, radius: 3, color: blue, spacing: 10, hasStroke: true, type: 'diagonal' });
            break;
        case types.FRAGILE:
            drawHatchedRoundRect({ ctx, position: this.position, width: this.width, height: this.height, radius: 3, color: red, spacing: 6, hasStroke: false });
            break;
        }
    }

    update(ctx) {
        this.draw(ctx);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.isMoving) {
            if(this.left <= 0 || this.right >= ctx.canvas.width) {
                this.velocity.x *= -1;
            }
        }
    }

    get left() {
        return this.position.x;
    }

    get right() {
        return this.position.x + this.width;
    }

    get top() {
        return this.position.y;
    }

    get bottom() {
        return this.position.y + this.height;
    }
}

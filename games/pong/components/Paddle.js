const SPEED = 0.01;

export default class Paddle {
    constructor(element) {
        this.element = element;
    }

    get position() {
        return parseFloat(
            getComputedStyle(this.element).getPropertyValue('--position')
        );
    }

    set position(value) {
        this.element.style.setProperty('--position', value);
    }

    get rect() {
        return this.element.getBoundingClientRect();
    }

    reset() {
        this.position = 50;
    }

    update(delta, ballHeight) {
        this.position += SPEED * delta *  (ballHeight - this.position);
    }
}

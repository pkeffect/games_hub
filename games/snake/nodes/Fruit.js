export default class Fruit {

    constructor({ scale, ctx, canvas })
    {
        this.position = { x: 0, y: 0 };
        this.scale = scale;
        this.ctx = ctx;
        this.rows = canvas.height / scale;
        this.cols = canvas.width / scale;
    }

    pickLocation() {
        this.position = {
            x: (Math.floor(Math.random() * this.rows - 1) + 1) * this.scale,
            y: (Math.floor(Math.random() * this.cols - 1) + 1) * this.scale
        };
    }

    draw() {
        this.ctx.fillStyle = '#212519';
        this.ctx.beginPath();
        this.ctx.arc(this.position.x + this.scale / 2, this.position.y + this.scale / 2, this.scale / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    update() {
        this.draw();
    }
}

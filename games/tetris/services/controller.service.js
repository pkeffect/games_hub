class ButtonInput {
    isActive = false;
    isPressed = false;

    getInput(isPressed) {
        if (this.isPressed !== isPressed) this.isActive = isPressed;
        this.isPressed = isPressed;
    }
}

export default class Controller {
    down = new ButtonInput();
    left = new ButtonInput();
    right = new ButtonInput();
    debug = new ButtonInput();
    space = new ButtonInput();
    rotate = new ButtonInput();
    esc = new ButtonInput();
    pause = new ButtonInput();

    keyDownUp(event) {
        const { type, key } = event;

        event.preventDefault();

        const isPressed = type === 'keydown';
        // console.log(keyCode);

        switch (key) {
        case 'ArrowLeft':
            this.left.getInput(isPressed);
            break;
        case '`':
            this.debug.getInput(isPressed);
            break;
        case 'ArrowRight':
            this.right.getInput(isPressed);
            break;
        case 'ArrowUp':
            this.rotate.getInput(isPressed);
            break;
        case 'ArrowDown':
            this.down.getInput(isPressed);
            break;
        case ' ':
            this.space.getInput(isPressed);
            break;
        case 'Esc':
            this.esc.getInput(isPressed);
            break;
        case 'p':
            this.pause.getInput(isPressed);
            break;
        default: break;
        }
    }

    handleKeyDownUp = (event) => {
        this.keyDownUp(event);
    };
}

const DURATION = 5000;

export default class NotificationsService {
    activeNotifications = [];

    constructor(renderElement) {
        this.renderElement = renderElement;
    }

    show(text, type = '') {
        const id = `notification-${this.activeNotifications.length}`;

        const notification = { id, text, type };

        this.activeNotifications.push(notification);

        this.render(notification);

        const timeout = setTimeout(() => {
            this.remove(notification);
            clearTimeout(timeout);
        }, DURATION);
    }

    render(notification) {
        this.renderElement.insertAdjacentHTML(
            'afterbegin',
            this.getTemplate(notification)
        );
        this.initCancelButton(notification);
    }

    remove(notification) {
        this.activeNotifications.filter(item => item.id !== notification.id);
        const element = document.getElementById(`${notification.id}`);
        if (element) {
            element.removeEventListener('click', this.cancelClickHandler);
            element.remove();
        }
    }

    getTemplate(notification) {
        return `
        <div class="notification ${notification.type}" id="${notification.id}">
            <div class="notification-header">
                <button class="notification-close-button" notification-id="${notification.id}">X</button>
            </div>
            <div class="notification-body">${notification.text}</div>
            <div class="notification-footer">
                <span class="notification-progress" style="animation-duration: ${DURATION}ms"></span>
            </div>
        </div>
        `;
    }

    initCancelButton(notification) {
        const element = document.querySelector(`[notification-id=${notification.id}]`);
        element.addEventListener('click', () => this.remove(notification));
    }
}

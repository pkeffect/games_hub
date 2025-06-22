class ViewService {
    #currentView = '';
    #previousView = '';

    constructor() {
        if (ViewService.instance) {
            return ViewService.instance;
        }

        this.#init();
        ViewService.instance = this;
    }

    get currentView() {
        return this.#currentView;
    }

    get previousView() {
        return this.#previousView;
    }

    #init() {}

    viewExists(view) {
        return !!document.querySelector(`[data-view="${view}"]`);
    }

    hideView() {
        const view = this.#currentView;

        this.#previousView = this.#currentView;
        this.#currentView = '';

        document.querySelector(`[data-view="${view}"]`).classList.add('hidden');
    }

    showView(view) {
        if (!this.viewExists(view)) throw new Error(`View does not exist: ${view}`);

        if (this.#currentView) this.hideView(this.#currentView);
        this.#currentView = view;

        document.querySelector(`[data-view="${view}"]`).classList.remove('hidden');
    }
}

export default ViewService;

export class Selected {
    constructor() {
        this.value = null;
    }

    set(value) {
        this.value = value;
    }

    unset() {
        this.value = null;
    }

    get() {
        return this.value;
    }
}

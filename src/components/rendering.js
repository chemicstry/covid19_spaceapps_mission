import { SystemStateComponent } from "ecsy";

// Renderable component where display_object is PIXI.js DisplayObject
export class Renderable {
    constructor(display_object) {
        this.display_object = display_object;
    }

    reset() {
        this.display_object = null;
    }
}

// Marker component, that this entity was already added to the scene
export class Rendered extends SystemStateComponent {
    constructor(display_object) {
        super();
        this.display_object = display_object
    }

    reset() {
        this.display_object = null;
    }
}

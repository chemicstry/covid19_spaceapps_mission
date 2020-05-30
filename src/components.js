import { SystemStateComponent } from "ecsy";

export class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.x = 0;
        this.y = 0;
    }
}

// Destination where entity should move
export class Destination extends Position {}

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
}

// Game grid
export class Grid {
    constructor(divisions, size) {
        this.divisions = divisions;
        this.size = size;
    }
}

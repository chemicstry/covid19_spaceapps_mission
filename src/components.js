import { SystemStateComponent } from "ecsy";
import Victor from "victor";

export class MovementPath {
    constructor(path) {
        this.path = path; // Array of Victor points
        this.index = 0; // Index of the current point in path array
    }

    reset() {
        this.path.length = 0;
        this.index = 0;
    }
}

export class Position extends Victor {}

// Destination where entity should move
export class Destination extends Victor {}

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

// Game grid
export class Grid {
    constructor(major_step, minor_step, size) {
        this.major_step = major_step;
        this.minor_step = minor_step;
        this.size = size;
    }
}

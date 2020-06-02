import Victor from "victor";

export class Position extends Victor {}

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

// Destination where entity should move (in a straight line)
export class Destination extends Victor {}

// Pathfinding destination (avoids obstacles)
export class PFDestination extends Victor {}

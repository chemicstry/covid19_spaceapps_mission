import { System, Not } from "ecsy";
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

// Destination where entity should move
export class Destination extends Victor {}

export class PathMovementSystem extends System {
    execute() {
        this.queries.entities.results.forEach(e => {
            let path = e.getComponent(MovementPath);
            
            if (path.index < path.path.length) {
                // Set next destination
                e.addComponent(Destination, path.path[path.index])
                path.index += 1;
            } else {
                // Path finished
                e.removeComponent(MovementPath);
            }
        })
    }
}

PathMovementSystem.queries = {
    // Find entities that have a path, but no destination yet
    entities: { components: [MovementPath, Not(Destination)] },
};

export class DestinationMovementSystem extends System {
    execute(dt) {
        this.queries.entities.results.forEach(e => {
            let pos = e.getComponent(Position);
            let dest = e.getComponent(Destination);
            
            // Must be more complicated (implement path finding?)
            if (dest.distanceSq(pos) < 1.0) {
                pos.copy(dest);
                e.removeComponent(Destination);
            } else {
                let dir = dest.clone().subtract(pos).norm();
                let speed = new Victor(dt * 0.1, dt * 0.1);
                pos.add(dir.multiply(speed));
            }
        })
    }
}

DestinationMovementSystem.queries = {
    entities: { components: [Position, Destination] },
};

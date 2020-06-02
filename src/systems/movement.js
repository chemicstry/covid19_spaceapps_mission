import { System, Not } from "ecsy";
import Victor from "victor";
import { WalkableGrid } from "components/grid";
import { MovementPath, Destination, PFDestination, Position } from "components/movement";

export class PathMovementSystem extends System {
    execute() {
        let ctx = this.queries.context.results[0];

        this.queries.process_path.results.forEach(e => {
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

        // Generate paths
        this.queries.gen_path.results.forEach(e => {
            let walkableGrid = ctx.getComponent(WalkableGrid);
            let src = e.getComponent(Position);
            let dst = e.getComponent(PFDestination);
            walkableGrid.getPath(src, dst, (path) => {
                if (!path)
                    return console.log("Failed to generate path");
                
                e.removeComponent(MovementPath);
                e.addComponent(MovementPath, new MovementPath(path));
            });
            e.removeComponent(PFDestination); // Do not generate again
        })
    }
}

PathMovementSystem.queries = {
    // Find entities that have a path, but no destination yet
    process_path: { components: [MovementPath, Not(Destination)] },
    gen_path: { components: [Position, PFDestination]},
    context: { components: [WalkableGrid], mandatory: true }
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
                let speed = new Victor(dt * 0.05, dt * 0.05);
                pos.add(dir.multiply(speed));
            }
        })
    }
}

DestinationMovementSystem.queries = {
    entities: { components: [Position, Destination] },
};

import { System, Not } from "ecsy";
import Victor from "victor";
import { WalkableGrid, Grid } from "components/grid";
import { MovementPath, Destination, PFDestination, Position } from "components/movement";
import { limit } from "utils/math";
import { Time } from "components/time";

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
    execute() {
        let ctx = this.queries.context.results[0];
        let grid = ctx.getComponent(Grid);
        let time = ctx.getComponent(Time);
        let speed = new Victor(time.dt * 0.0002, time.dt * 0.0002);

        this.queries.entities.results.forEach(e => {
            let pos = e.getComponent(Position);
            let dest = e.getComponent(Destination);
            
            // Must be more complicated (implement path finding?)
            if (dest.distanceSq(pos) < speed.lengthSq()) {
                pos.copy(dest);
                e.removeComponent(Destination);
            } else {
                let dir = dest.clone().subtract(pos).norm();
                pos.add(dir.multiply(speed));
                pos.x = limit(pos.x, 0, grid.size.x);
                pos.y = limit(pos.y, 0, grid.size.y);
            }
        })
    }
}

DestinationMovementSystem.queries = {
    context: { components: [Grid, Time], mandatory: true },
    entities: { components: [Position, Destination] },
};

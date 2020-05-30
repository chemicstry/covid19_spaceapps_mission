import { System, Not } from "ecsy";
import {
    Grid, Renderable, Rendered, Position, Destination, MovementPath
} from "./components.js";
import * as PIXI from 'pixi.js';
import Victor from "victor";

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

// Updates PIXI.js object positions from Position component
export class PositionUpdateSystem extends System {
    execute() {
        this.queries.entities.results.forEach(e => {
            let pos = e.getComponent(Position);
            e.getComponent(Renderable).display_object.position.set(pos.x, pos.y);
        })
    }
}

PositionUpdateSystem.queries = {
    entities: { components: [Renderable, Position] },
};

export class Renderer extends System {
    constructor(world, attributes){
        super(world, attributes);
        this.pixiApp = new PIXI.Application();
        document.body.appendChild(this.pixiApp.view);

        // Create isometric rendering by setting y scale to 0.5
        this.isoScalingContainer = new PIXI.Container();
        this.isoScalingContainer.scale.y = 0.5;
        this.isoScalingContainer.position.set(this.pixiApp.screen.width / 2, this.pixiApp.screen.height / 2);
        this.pixiApp.stage.addChild(this.isoScalingContainer);

        // Rotate world container by 45 degrees
        this.worldContainer = new PIXI.Container();
        this.worldContainer.rotation = Math.PI / 4;
        this.isoScalingContainer.addChild(this.worldContainer);
    }

    updateGrid(grid) {
        // Recreate grid if dimensions changed
        if (this.grid != grid) {
            if (this.grid) {
                this.worldContainer.removeChild(this.gridContainer);
            }

            this.grid = grid;
            this.gridContainer = new PIXI.Graphics();
            this.worldContainer.addChild(this.gridContainer);

            let size_x = grid.size[0];
            let step_x = size_x / grid.divisions[0];
            let size_y = grid.size[1];
            let step_y = size_x / grid.divisions[1];
            this.worldContainer.position.set(0, -size_y/2);

            // Draw grid lines
            this.gridContainer.lineStyle(2, 0xffffff);
            for (let i = 0; i <= size_x; i += step_x) {
                this.gridContainer.moveTo(i, 0);
                this.gridContainer.lineTo(i, size_y);
            }
            for (let i = 0; i <= size_y; i += step_y) {
                this.gridContainer.moveTo(0, i);
                this.gridContainer.lineTo(size_x, i);
            }
        }
    }

    renderThings(query) {
        renderables.filter(r => !this.rendered.includes(r)).forEach(r => {
            this.worldContainer.addChild(r);
        });
    }

    execute() {
        let ctx = this.queries.context.results[0];
        this.updateGrid(ctx.getComponent(Grid));
        
        // Process newly added `Renderable` components
        this.queries.added.results.forEach(e => {
            let renderable = e.getComponent(Renderable);
            this.worldContainer.addChild(renderable.display_object);
            e.addComponent(Rendered, new Rendered(renderable.display_object));
        });

        // Process removed `Renderable` components
        this.queries.removed.results.forEach(e => {
            let rendered = e.getComponent(Rendered);
            this.worldContainer.removeChild(rendered.display_object);
            e.removeComponent(Rendered);
        });

        this.pixiApp.render();
    }
}

Renderer.queries = {
    added: { components: [Renderable, Not(Rendered)] },
    removed: { components: [Not(Renderable), Rendered] },
    context: { components: [Grid], mandatory: true }
};

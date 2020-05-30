import { System, Not } from "ecsy";
import {
    Grid, Renderable, Rendered, Position, Destination
} from "./components.js";
import * as PIXI from 'pixi.js';

export class HumanMovementSystem extends System {
    execute(dt) {
        this.queries.entities.results.forEach(e => {
            let pos = e.getComponent(Position);
            let dest = e.getComponent(Destination);
            
            // Must be more complicated (implement path finding?)
            let dir_x = dest.x - pos.x;
            let dir_y = dest.y - pos.y;
            pos.x += Math.min(dir_x, 0.1) * dt
            pos.y += Math.min(dir_y, 0.1) * dt
        })
    }
}

HumanMovementSystem.queries = {
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

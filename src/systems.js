import { System, Not } from "ecsy";
import {
    Grid, Renderable, Rendered, Position, Destination, MovementPath
} from "./components.js";
import * as PIXI from 'pixi.js';
import Victor from "victor";
import * as utils from "./utils.js";

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
    constructor(world, attributes) {
        super(world, attributes);

        this.pixiApp = new PIXI.Application({
            view: document.getElementById('game'),
            backgroundColor: 0x1A1A60,
            antialias: true,
            autoResize: true,
        });
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

        window.addEventListener('resize', () => this.on_resize());
        this.on_resize();
    }

    on_resize() {
        let defaultWidth = 800;
        let defaultHeight = 600;

        // Resize renderer
        const parent = this.pixiApp.view.parentNode;
        this.pixiApp.renderer.resize(parent.clientWidth, parent.clientHeight);

        // Rescale from default 800x600 resolution
        let scale = Math.min(parent.clientWidth / defaultWidth, parent.clientHeight / defaultHeight);
        this.pixiApp.stage.scale.set(scale);

        // Recenter
        let gameWidth = defaultWidth * scale;
        let gameHeight = defaultHeight * scale;
        let offsetWidth = (parent.clientWidth - gameWidth) / 2;
        let offsetHeight = (parent.clientHeight - gameHeight) / 2;
        this.pixiApp.stage.position.x = offsetWidth;
        this.pixiApp.stage.position.y = offsetHeight;
    }

    updateGrid(grid) {
        // Recreate grid if dimensions changed
        if (this.grid != grid) {
            if (this.grid) {
                this.worldContainer.removeChild(this.gridContainer);
            }

            this.grid = grid;
            this.gridContainer = new PIXI.Container();
            this.gridGraphics = new PIXI.Graphics();
            this.gridContainer.addChild(this.gridGraphics);
            this.worldContainer.addChild(this.gridContainer);

            this.worldContainer.position.set(0, -grid.size.y/2);

            // Draw minor grid lines
            this.gridGraphics.lineStyle(1, 0x5C5C8E, 0.4);
            for (let i = -1000; i <= 1000; i += grid.minor_step.x) {
                this.gridGraphics.moveTo(i, -10000);
                this.gridGraphics.lineTo(i, 10000);
            }
            for (let i = -1000; i <= 1000; i += grid.minor_step.y) {
                this.gridGraphics.moveTo(-10000, i);
                this.gridGraphics.lineTo(10000, i);
            }

            // Draw major grid lines
            this.gridGraphics.lineStyle(2, 0x5C5C8E);
            for (let i = 0; i <= grid.size.x; i += grid.major_step.x) {
                this.gridGraphics.moveTo(i, 0);
                this.gridGraphics.drawDashLine(i, grid.size.y, 5, 10);
            }
            for (let i = 0; i <= grid.size.y; i += grid.major_step.y) {
                this.gridGraphics.moveTo(0, i);
                this.gridGraphics.drawDashLine(grid.size.x, i, 10, 10);
            }

            // const texture = this.gridGraphics.generateCanvasTexture(PIXI.SCALE_MODES.LINEAR);
            // const sprite = new PIXI.Sprite();
            // sprite.texture = texture;
            // this.gridContainer.addChild(sprite);
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

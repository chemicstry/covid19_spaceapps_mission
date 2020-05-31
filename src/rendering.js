import { System, Not, SystemStateComponent } from "ecsy";
import { Grid } from "./grid.js";
import * as PIXI from 'pixi.js';
import { Position } from "./movement.js";
import { Selected } from "./interraction.js";

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

        this.defaultWidth = 1200;
        this.defaultHeight = 800;

        this.pixiApp = new PIXI.Application({
            view: document.getElementById('game'),
            backgroundColor: 0x1A1A60,
            antialias: true,
            autoResize: true,
            width: this.defaultWidth,
            height: this.defaultHeight,
        });
        document.body.appendChild(this.pixiApp.view);

        // Create isometric rendering by setting y scale to 0.5
        this.isoScalingContainer = new PIXI.Container();
        this.isoScalingContainer.scale.y = 0.6;
        this.isoScalingContainer.position.set(this.pixiApp.screen.width / 2, this.pixiApp.screen.height / 2 - 70);
        this.pixiApp.stage.addChild(this.isoScalingContainer);

        // Rotate world container by 45 degrees
        this.worldContainer = new PIXI.Container();
        this.worldContainer.sortableChildren = true;
        this.worldContainer.rotation = Math.PI / 4;
        this.worldContainer.interactive = true; // Only works on rendered area :(
        this.worldContainer.on('click', () => {
            this.bg_clicked = true;
        });
        this.isoScalingContainer.addChild(this.worldContainer);

        // const basicText = new PIXI.Text('Space Society Twente');
        // basicText.x = 0;
        // basicText.y = 0;
        // basicText.style = new PIXI.TextStyle({
        //     fill: ['#ffffff', '#00ff99']
        // });
        // this.pixiApp.stage.addChild(basicText);

        window.addEventListener('resize', () => this.on_resize());
        this.on_resize();
    }

    on_resize() {
        // Resize renderer
        const parent = this.pixiApp.view.parentNode;
        this.pixiApp.renderer.resize(parent.clientWidth, parent.clientHeight);

        // Rescale from default 800x600 resolution
        let scale = Math.min(parent.clientWidth / this.defaultWidth, parent.clientHeight / this.defaultHeight );
        this.pixiApp.stage.scale.set(scale);

        // Recenter
        let gameWidth = this.defaultWidth * scale;
        let gameHeight = this.defaultHeight  * scale;
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
            this.gridContainer.zIndex = -2;
            this.gridGraphics = new PIXI.Graphics();
            this.gridContainer.addChild(this.gridGraphics);
            this.worldContainer.addChild(this.gridContainer);

            this.worldContainer.position.set(0, -grid.size.y/2);

            // Draw minor grid lines
            this.gridGraphics.lineStyle(1, 0x5C5C8E, 0.4);
            for (let i = -1000; i <= 2000; i += grid.minor_step.x) {
                this.gridGraphics.moveTo(i, -10000);
                this.gridGraphics.lineTo(i, 10000);
            }
            for (let i = -1000; i <= 2000; i += grid.minor_step.y) {
                this.gridGraphics.moveTo(-10000, i);
                this.gridGraphics.lineTo(10000, i);
            }

            // Draw major grid lines
            this.gridGraphics.lineStyle(2, 0x5C5C8E);
            for (let i = 0; i <= grid.size.x; i += grid.major_step.x) {
                this.gridGraphics.moveTo(i, 0);
                this.gridGraphics.drawDashLine(i, grid.size.y, 10, 10);
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

        if (this.bg_clicked) {
            ctx.getComponent(Selected).unset();
            this.bg_clicked = false;
        }
        
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
    context: { components: [Grid, Selected], mandatory: true }
};

import { System, Not } from "ecsy";
import { Destination, PFDestination, MovementPath, Position } from "components/movement";
import { Renderable } from "components/rendering";
import { Time } from "components/time";
import { Selected } from "components/interraction";
import { WalkableGrid } from "components/grid";
import * as PIXI from 'pixi.js';
import { Schedule, Human } from "components/human";
import { InfectedRevealed } from "components/infection";
import { HumanSchedulePoint } from "components/human";

export class HumanSchedulingSystem extends System {
    execute() {
        let time = this.queries.context.results[0].getComponent(Time);
        this.queries.schedulable.results.forEach(e => {
            let schedule = e.getComponent(Schedule);
            let event = schedule.getEvent(time.value);
            if (event) {
                e.addComponent(PFDestination, event.data.clone());
            }
        })
    }
}

HumanSchedulingSystem.queries = {
    schedulable: { components: [Schedule] },
    context: { components: [Time], mandatory: true },
};

export class HumanSpriteRenderingSystem extends System {
    static getColor(e) {
        if (e.getComponent(InfectedRevealed) /*&& e.getComponent(Tested)*/)
            return 0xE52E74;
        else
            return 0x33DDAC;
    }

    execute() {
        this.queries.enlarged.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            graphics.clear();
            graphics.lineStyle(4, HumanSpriteRenderingSystem.getColor(e));
            graphics.drawCircle(0, 0, 5);
            graphics.endFill();
        });

        this.queries.small.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            graphics.clear();
            graphics.beginFill(HumanSpriteRenderingSystem.getColor(e));
            graphics.drawCircle(0, 0, 4);
            graphics.endFill();
        });

        this.queries.schedule_points.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            let human = e.getComponent(HumanSchedulePoint).human;
            graphics.clear();

            // Only draw when actual human is not in the same place
            if (e.getComponent(Position).distanceSq(human.getComponent(Position)) > 0) {
                // Many attempts, still doesn't look right
                // graphics.beginFill(HumanSpriteRenderingSystem.getColor(human));
                // graphics.drawEllipse(0, 0, 2, 8);
                // graphics.drawEllipse(0, 0, 8, 2);
                // graphics.endFill();
                // graphics.lineStyle(2, HumanSpriteRenderingSystem.getColor(human));
                // graphics.moveTo(-4, -4);
                // graphics.lineTo(4, 4);
                // graphics.moveTo(4, -4);
                // graphics.lineTo(-4, 4);
                graphics.beginFill(HumanSpriteRenderingSystem.getColor(human));
                graphics.drawRoundedRect(-6, -1.5, 12, 3, 3);
                graphics.drawRoundedRect(-1.5, -6, 3, 12, 3);
                graphics.drawEllipse(0, 0, 2, 6);
                graphics.drawEllipse(0, 0, 6, 2);
                graphics.endFill();
            }
        })
    }
}

HumanSpriteRenderingSystem.queries = {
    enlarged: { components: [Renderable, Human, Destination] },
    small: { components: [Renderable, Human, Not(Destination), Not(MovementPath)] },
    schedule_points: { components: [Renderable, HumanSchedulePoint, Position] }
};

export class ScheduleDisplaySystem extends System {
    constructor(world, attributes) {
        super(world, attributes);
        this.entity = world.createEntity();
    }

    execute() {
        let context = this.queries.context.results[0];
        let selected = context.getComponent(Selected).get();
        let grid = context.getComponent(WalkableGrid);
        if (selected != this.selected_entity) {
            if (this.entity.hasComponent(Renderable)) {
                this.entity.removeComponent(Renderable);
            }

            this.selected_entity = selected;

            if (!selected)
                return;

            const schedule = selected.getComponent(Schedule);
            if (schedule.events.length < 2)
                return;
            
            const color = HumanSpriteRenderingSystem.getColor(selected);

            let points = [];
            for (var i = 1; i < schedule.events.length; ++i)
                points.push([
                    schedule.events[i-1].data, // Start position
                    schedule.events[i].data // end position
                ]);

            // wrap around
            points.push([
                schedule.events[i-1].data, // Start position
                schedule.events[0].data // end position
            ]);

            let renderPaths = (paths) => {
                let graphics = new PIXI.Graphics();
                graphics.lineStyle(4, color);
                graphics.zIndex = -1;
                for (const path of paths) {
                    for (let i = 0; i < path.length; ++i) {
                        if (i == 0) {
                            graphics.beginFill(color);
                            //graphics.drawCircle(path[i].x, path[i].y, 4);
                            graphics.endFill();
                            graphics.moveTo(path[i].x, path[i].y);
                        } else
                            graphics.lineTo(path[i].x, path[i].y);
                    }
                }

                this.entity.addComponent(Renderable, new Renderable(graphics));
            }

            let genPaths = (points, paths) => {
                if (!points.length) {
                    renderPaths(paths);
                } else {
                    let next = points.pop();
                    grid.getPath(next[0], next[1], (path) => {
                        paths.push(path);
                        genPaths(points, paths);
                    })
                }
            }

            genPaths(points, []);
        }
    }
}

ScheduleDisplaySystem.queries = {
    context: { components: [Selected, WalkableGrid], mandatory: true },
};

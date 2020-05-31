import { System, Not, TagComponent } from "ecsy";
import { Destination, Position, PFDestination, MovementPath } from "./movement";
import { Renderable } from "./rendering";
import { Time } from "./time";
import { Selected } from "./interraction";
import { WalkableGrid, Grid } from "./grid";
import * as PIXI from 'pixi.js';
import { Infected, Tested } from "./infection";

export class Human extends TagComponent {}

export class Event {
    static Type = {
        GO_HOME: 1,
        GO_WORK: 2,
        GO_SHOPPING: 3,
        GO_PARK: 4,
    }

    constructor(event, time, data) {
        this.event = event;
        this.time = time;
        this.data = data;
    }
}

export class Schedule {
    constructor() {
        this.events = [];
        this.repeat = 0; // Time interval when the schedule repeats
        this.repeat_count = 0;
        this.next = 0;
    }

    getEvent(time) {
        // Schedule exhausted
        if (this.next >= this.events.length)
            return null;
        
        // Not yet
        if (this.events[this.next].time + this.repeat*this.repeat_count > time)
            return null;

        let event = this.events[this.next++];

        // Reset schedule if it's repeating
        if (this.repeat && this.next == this.events.length) {
            this.next = 0;
            this.repeat_count++;
        }
        
        return event;
    }
}

export class HumanScheduler extends System {
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

HumanScheduler.queries = {
    schedulable: { components: [Schedule] },
    context: { components: [Time], mandatory: true },
};

export class HumanSpriteRendering extends System {
    static getColor(e) {
        if (e.getComponent(Infected) && e.getComponent(Tested))
            return 0xE52E74;
        else
            return 0x33DDAC;
    }

    execute() {
        this.queries.enlarged.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            graphics.clear();
            graphics.lineStyle(4, HumanSpriteRendering.getColor(e));
            graphics.drawCircle(0, 0, 5);
            graphics.endFill();
        });

        this.queries.small.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            graphics.clear();
            graphics.beginFill(HumanSpriteRendering.getColor(e));
            graphics.drawCircle(0, 0, 4);
            graphics.endFill();
        });
    }
}

HumanSpriteRendering.queries = {
    enlarged: { components: [Renderable, Human, Destination] },
    small: { components: [Renderable, Human, Not(Destination), Not(MovementPath)] }
};

export class ScheduleDisplay extends System {
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

            let schedule = selected.getComponent(Schedule);
            if (schedule.events.length < 2)
                return;

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
                graphics.lineStyle(4, 0x33DDAC);
                graphics.zIndex = -1;
                for (const path of paths) {
                    for (let i = 0; i < path.length; ++i) {
                        if (i == 0)
                            graphics.moveTo(path[i].x, path[i].y);
                        else
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

ScheduleDisplay.queries = {
    context: { components: [Selected, WalkableGrid], mandatory: true },
};

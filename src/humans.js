import { System, Not, TagComponent } from "ecsy";
import { Destination } from "./movement";
import { Renderable } from "./rendering";

export class Human extends TagComponent {}

export class Infected extends TagComponent {}

export class Tested extends TagComponent {}

export class Schedule {
    constructor() {
        this.schedule = [];
        this.next = 0;
    }

    getEvent(time) {
        if (!this.schedule.length)
            return null;
    }
}

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
            graphics.scale.set(1.0, 1.0/0.6); // Fix isometry 
            graphics.rotation = -Math.PI / 4;
            graphics.clear();
            graphics.lineStyle(4, HumanSpriteRendering.getColor(e));
            graphics.drawCircle(0, 0, 5);
            graphics.endFill();
        });

        this.queries.small.results.forEach(e => {
            let graphics = e.getComponent(Renderable).display_object;
            graphics.scale.set(1.0, 1.0/0.6); // Fix isometry 
            graphics.rotation = -Math.PI / 4;
            graphics.clear();
            graphics.beginFill(HumanSpriteRendering.getColor(e));
            graphics.drawCircle(0, 0, 4);
            graphics.endFill();
        });
    }
}

HumanSpriteRendering.queries = {
    enlarged: { components: [Renderable, Human, Destination] },
    small: { components: [Renderable, Human, Not(Destination)] }
};

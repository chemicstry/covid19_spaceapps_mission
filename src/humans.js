import { System, Not, TagComponent } from "ecsy";
import { Destination, Position, PFDestination, MovementPath } from "./movement";
import { Renderable } from "./rendering";
import { Time } from "./time";

export class Human extends TagComponent {}

export class Infected extends TagComponent {}

export class Tested extends TagComponent {}

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
                console.log(event);
                console.log(time.getHours());
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
    small: { components: [Renderable, Human, Not(Destination), Not(MovementPath)] }
};

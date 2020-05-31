import { System } from "pixi.js";

export class Time {
    constructor() {
        // Time in milliseconds
        this.value = 0;
    }

    getMinutes() {
        return Math.floor(this.value / 1000 / 60) % 60;
    }

    getHours() {
        return Math.floor(this.value / 1000 / 60 / 60) % 24;
    }

    getDay() {
        return Math.floor(this.value / 1000 / 60 / 60 / 24);
    }
}

export class TimeSystem extends System {
    static time_speed = 100;

    execute(dt) {
        let singleton = this.queries.context.results[0];
        let time = singleton.getComponent(Time);
        time.value += dt*time_speed;
    }
}

TimeSystem.queries = {
    context: { components: [Time], mandatory: true }
}

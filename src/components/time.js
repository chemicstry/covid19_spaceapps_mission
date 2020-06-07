export class Time {
    constructor() {
        // Time in milliseconds
        this.value = 2*60*60*1000;
        this.dt = 0;
        this.speed = 600.0;
    }

    update(dt) {
        this.dt = dt * this.speed;
        this.value += this.dt;
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

// Time when vaccine will be found (game finishes)
export class VaccineTime extends Time { }

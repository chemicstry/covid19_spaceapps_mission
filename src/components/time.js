export class Time {
    constructor() {
        // Time in milliseconds
        this.value = 2*60*60*1000;
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

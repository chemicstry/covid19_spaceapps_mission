import { createComponentClass } from "ecsy";

export const Human = createComponentClass({
    name: { default: "" } // Reference to human entity
}, "Human");

// Marker where human has scheduled locations
export const HumanSchedulePoint = createComponentClass({
    human: { default: null } // Reference to human entity
}, "HumanSchedulePoint");

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

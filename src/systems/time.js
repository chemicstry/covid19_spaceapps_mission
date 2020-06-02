import { System } from "ecsy";
import { Time } from "components/time";

export class TimeSystem extends System {
    static TIME_SPEED = 600.0;

    execute(dt) {
        let singleton = this.queries.context.results[0];
        let time = singleton.getComponent(Time);
        time.value += dt*TimeSystem.TIME_SPEED;
    }
}

TimeSystem.queries = {
    context: { components: [Time], mandatory: true }
}

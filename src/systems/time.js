import { System } from "ecsy";
import { Time } from "components/time";

export class TimeSystem extends System {
    execute(dt) {
        let singleton = this.queries.context.results[0];
        singleton.getComponent(Time).update(dt);
    }
}

TimeSystem.queries = {
    context: { components: [Time], mandatory: true }
}

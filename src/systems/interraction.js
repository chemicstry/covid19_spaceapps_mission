import { System } from "ecsy";
import { Time, VaccineTime } from "components/time";
import { padNumber } from "utils/utils";

export class UIUpdateSystem extends System {
    constructor(world, attributes) {
        super(world, attributes);

        this.timeElement = document.getElementById('current_time');
        this.progressBarElement = document.getElementById('progress_bar');
    }

    execute() {
        let ctx = this.queries.context.results[0];
        let time = ctx.getComponent(Time);
        let vaccineTime = ctx.getComponent(VaccineTime);

        // Update time display
        let day = time.getDay()+1;
        let hours = padNumber(time.getHours(), 2);
        let minutes = padNumber(time.getMinutes(), 2);
        this.timeElement.innerText = `Day ${day}, ${hours}:${minutes}`;

        // Update progress bar
        let progress = time.value / vaccineTime.value;
        this.progressBarElement.style.width = `${progress*100.0}%`;
    }
}

UIUpdateSystem.queries = {
    context: { components: [Time, VaccineTime] },
};

import { System } from "ecsy";
import { Time, VaccineTime } from "components/time";
import { padNumber } from "utils/math";
import { Selected } from "components/interraction";
import { InfectedRevealed } from "components/infection";
import { Human } from "components/human";

export class UIUpdateSystem extends System {
    constructor(world, attributes) {
        super(world, attributes);

        this.timeElement = document.getElementById('current_time');
        this.progressBarElement = document.getElementById('progress_bar');
        this.selectedPanel = document.getElementById('selected_panel');
        this.selectedPanel.getElementsByClassName('btn_left')[0].addEventListener('click', () => this.onClickTestButton());
        this.selectedPanel.getElementsByClassName('btn_right')[0].addEventListener('click', () => this.onClickIsolateButton());
    }

    onClickTestButton() {
        console.log('click')
    }

    onClickIsolateButton() {

    }

    updateSelectedPanel(selected) {
        if (!selected) {
            this.selectedPanel.style.display = 'none';
            return;
        }

        // Show
        this.selectedPanel.style.display = 'block';

        const infected = selected.hasComponent(InfectedRevealed);
        const name = selected.getComponent(Human).name;
        
        // Update icon
        let icon = this.selectedPanel.getElementsByClassName('icon')[0];
        icon.classList.remove('sick', 'healthy');
        icon.classList.add(infected ? 'sick' : 'healthy');

        // Update name
        let nameEl = this.selectedPanel.getElementsByClassName('name')[0];
        nameEl.innerText = name;

        // Buttons
        let testBtn = this.selectedPanel.getElementsByClassName('btn_left')[0];
        testBtn.disabled = infected;
    }

    execute() {
        let ctx = this.queries.context.results[0];
        let time = ctx.getComponent(Time);
        let vaccineTime = ctx.getComponent(VaccineTime);
        let selected = ctx.getComponent(Selected).get();

        // Update time display
        let day = time.getDay()+1;
        let hours = padNumber(time.getHours(), 2);
        let minutes = padNumber(time.getMinutes(), 2);
        this.timeElement.innerText = `Day ${day}, ${hours}:${minutes}`;

        // Update progress bar
        let progress = Math.min(time.value / vaccineTime.value, 1.0);
        this.progressBarElement.style.width = `${progress*100.0}%`;

        // Update selected panel
        this.selected = selected;
        this.updateSelectedPanel(selected);
        if (selected != this.selected) {
            this.selected = selected;
            if (selected) {
                this.selectedPanel.style.display = 'block';
                
            } else {
                this.selectedPanel.style.display = 'none';
            }
        }
    }
}

UIUpdateSystem.queries = {
    context: { components: [Time, VaccineTime, Selected] },
};

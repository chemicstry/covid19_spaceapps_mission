import { System, Not } from "ecsy";
import { Position } from "components/movement.js";
import { Human } from "components/human";
import { Infected } from "components/infection";

export class InfectionSpreadSystem extends System {
    static RATE = 0.01;

    execute(dt) {
        const infected_list = this.queries.infected.results;
        const susceptible_list = this.queries.susceptible.results;

        // O(n^2) pepelaugh
        for (const infected of infected_list) {
            const i_pos = infected.getComponent(Position);
            for (const susceptible of susceptible_list) {
                let s_pos = susceptible.getComponent(Position);
                let invdistSq = 1/Math.max(i_pos.distanceSq(s_pos), 2.0);
                let chance = dt * invdistSq * InfectionSpreadSystem.RATE;
                if (Math.random() < chance)
                    susceptible.addComponent(Infected);
            }
        }
    }
}

InfectionSpreadSystem.queries = {
    infected: { components: [Position, Infected] },
    susceptible: { components: [Position, Human, Not(Infected)] },
};

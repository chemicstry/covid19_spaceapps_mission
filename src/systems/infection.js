import { System, Not } from "ecsy";
import { Position } from "components/movement";
import { Human } from "components/human";
import { Infected, InfectedRevealed } from "components/infection";
import { Time } from "components/time";

export class InfectionSpreadSystem extends System {
    static RATE = 0.00001;

    execute() {
        const ctx = this.queries.context.results[0];
        const time = ctx.getComponent(Time);
        const infected_list = this.queries.infected.results;
        const susceptible_list = this.queries.susceptible.results;

        // O(n^2) pepelaugh
        for (const infected of infected_list) {
            const i_pos = infected.getComponent(Position);
            for (const susceptible of susceptible_list) {
                let s_pos = susceptible.getComponent(Position);
                let invdistSq = 1/Math.max(i_pos.distanceSq(s_pos), 2.0);
                let chance = time.dt * invdistSq * InfectionSpreadSystem.RATE;
                if (Math.random() < chance)
                    susceptible.addComponent(Infected, { time: time.value });
            }
        }
    }
}

InfectionSpreadSystem.queries = {
    context: { components: [Time], mandatory: true },
    infected: { components: [Position, Infected] },
    susceptible: { components: [Position, Human, Not(Infected)] },
};

export class InfectionRevealSystem extends System {
    static REVEAL_TIME = 5*60*60*1000;

    execute() {
        const ctx = this.queries.context.results[0];
        const time = ctx.getComponent(Time);

        for (const infected of this.queries.not_revealed.results) {
            const infection_time = infected.getComponent(Infected).time;
            if (infection_time + InfectionRevealSystem.REVEAL_TIME < time.value)
                infected.addComponent(InfectedRevealed);
        }

        for (const not_infected of this.queries.not_infected.results)
            not_infected.removeComponent(InfectedRevealed);
    }
}

InfectionRevealSystem.queries = {
    context: { components: [Time], mandatory: true },
    not_revealed: { components: [Infected, Not(InfectedRevealed)] },
    not_infected: { components: [Not(Infected), InfectedRevealed] }
};

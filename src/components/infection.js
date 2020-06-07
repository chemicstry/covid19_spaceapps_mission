import { createComponentClass, TagComponent } from "ecsy";

export const Infected = createComponentClass({
    time: { default: 0 }
}, "Infected");

export class InfectedRevealed extends TagComponent {}

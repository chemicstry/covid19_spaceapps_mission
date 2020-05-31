import * as PIXI from 'pixi.js';
import { random, randomInt } from './utils';

export class Building {
    constructor(texture) {
        this.texture = texture;
    }

    createSprite() {
        let scale = 0.585;
        let isometry_fix = 1.74; // Measured scientifically
        let sprite = new PIXI.Sprite(this.texture);
        sprite.rotation = -Math.PI / 4; // Fix isometry
        sprite.scale.set(scale, scale*isometry_fix); 
        sprite.anchor.set(0.5, 1.0);
        return sprite;
    }
}

export class BuildingRegistry {
    constructor() {
        this.buildings = [
            new Building(PIXI.Texture.from(require('assets/home.png'))),
            new Building(PIXI.Texture.from(require('assets/hospital.png'))),
            new Building(PIXI.Texture.from(require('assets/office.png'))),
            new Building(PIXI.Texture.from(require('assets/shop.png')))
        ];
    }

    getRandom() {
        return this.buildings[randomInt(0, this.buildings.length)];
    }
}

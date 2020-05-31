import * as PIXI from 'pixi.js';
import { random, randomInt } from './utils';

export class Building {
    constructor(type, texture) {
        this.type = type;
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
    static BuildingType = {
        HOME: 1,
        HOSPITAL: 2,
        OFFICE: 3,
        SHOP: 4,
    }

    constructor() {
        this.buildings = [
            new Building(
                BuildingRegistry.BuildingType.HOME,
                PIXI.Texture.from(require('assets/home.png'))
            ),
            new Building(
                BuildingRegistry.BuildingType.HOSPITAL,
                PIXI.Texture.from(require('assets/hospital.png'))
            ),
            new Building(
                BuildingRegistry.BuildingType.OFFICE,
                PIXI.Texture.from(require('assets/office.png'))
            ),
            new Building(
                BuildingRegistry.BuildingType.SHOP,
                PIXI.Texture.from(require('assets/shop.png'))
            )
        ];
    }

    getRandom() {
        return this.buildings[randomInt(0, this.buildings.length)];
    }
}

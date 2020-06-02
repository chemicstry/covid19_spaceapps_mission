import * as PIXI from 'pixi.js';
import { randomInt, shuffle } from 'utils/utils';

export class BuildingDefinition {
    static Type = {
        HOME: 1,
        HOSPITAL: 2,
        OFFICE: 3,
        SHOP: 4,
        PARK: 5,
    }

    constructor(type, texture) {
        this.type = type;
        this.texture = texture;
        this.positions = []; // Grid positions of placed buildings
    }

    createSprite() {
        let scale = 0.585;
        let isometry_fix = 1.74; // Measured scientifically
        let sprite = new PIXI.Sprite(this.texture);
        sprite.rotation = -Math.PI / 4; // Fix isometry
        sprite.scale.set(scale, scale*isometry_fix); 
        sprite.anchor.set(0.5, 1.0);
        // Human interactivity does not work under buildings
        // sprite.interactive = true;
        // sprite.on("pointerover", () => {
        //     sprite.alpha = 0.2;
        // });
        // sprite.on("pointerout", () => {
        //     sprite.alpha = 1.0;
        // });
        // sprite.hitArea = new PIXI.Polygon([
        //     0, 0,
        //     -140, -100,
        //     0, -200,
        //     140, -100,
        // ]);
        return sprite;
    }

    addPosition(pos) {
        this.positions.push(pos);
    }

    shufflePositions() {
        this.positions = shuffle(this.positions);
    }

    allocatePosition() {
        // Will be random after `shufflePositions` and more efficient
        return this.positions.pop();
    }
}

export class BuildingRegistry {
    constructor() {
        this.buildings = [
            new BuildingDefinition(
                BuildingDefinition.Type.HOME,
                PIXI.Texture.from(require('assets/home.png'))
            ),
            new BuildingDefinition(
                BuildingDefinition.Type.HOSPITAL,
                PIXI.Texture.from(require('assets/hospital.png'))
            ),
            new BuildingDefinition(
                BuildingDefinition.Type.OFFICE,
                PIXI.Texture.from(require('assets/office.png'))
            ),
            new BuildingDefinition(
                BuildingDefinition.Type.SHOP,
                PIXI.Texture.from(require('assets/shop.png'))
            ),
            new BuildingDefinition(
                BuildingDefinition.Type.PARK,
                PIXI.Texture.from(require('assets/park.png'))
            )
        ];
    }

    getRandom() {
        return this.buildings[randomInt(0, this.buildings.length)];
    }

    getByType(type) {
        for (const building of this.buildings)
            if (building.type == type)
                return building;

        return null;
    }
}

import {World, System} from 'ecsy';
import {Grid, WalkableGrid} from './grid.js';
import {Renderer, PositionUpdateSystem, Renderable} from './rendering.js';
import * as PIXI from 'pixi.js';
import Victor from 'victor';
import { BuildingRegistry } from './buildings.js';
import { PathMovementSystem, DestinationMovementSystem, Position, MovementPath, PFDestination } from './movement.js';
import { HumanSpriteAutosize, Human, HumanSpriteRendering } from './humans.js';

function generateBuildings(world, singleton) {
    var grid = singleton.getComponent(Grid);
    var buildingRegistry = singleton.getComponent(BuildingRegistry);
    var size = grid.size.clone().divide(grid.major_step);

    for (let x = 0; x < size.x; ++x) {
        for (let y = 0; y < size.y; ++y) {
            let sprite = buildingRegistry.getRandom().createSprite();
            let pos = grid.fromMajor(new Victor(x, y));
            pos = pos.add(new Victor(5*grid.minor_step.x, 5*grid.minor_step.y));
            world.createEntity()
                .addComponent(Renderable, new Renderable(sprite))
                .addComponent(Position, pos);
        }
    }
}

function start_game() {
    var world = new World();

    world
        .registerSystem(DestinationMovementSystem)
        .registerSystem(PathMovementSystem)
        .registerSystem(PositionUpdateSystem)
        .registerSystem(HumanSpriteRendering)
        .registerSystem(Renderer);

    let grid = new Grid(new Victor(140, 140), new Victor(20, 20), new Victor(700, 700));
    let walkableGrid = new WalkableGrid(grid);
    let buildingRegistry = new BuildingRegistry();

    // Singleton component (resources)
    let singleton = world.createEntity()
        .addComponent(Grid, grid)
        .addComponent(WalkableGrid, walkableGrid)
        .addComponent(BuildingRegistry, buildingRegistry);
    
    const basicText = new PIXI.Text('Space Society Twente');
    basicText.x = 0;
    basicText.y = 0;
    basicText.style = new PIXI.TextStyle({
        fill: ['#ffffff', '#00ff99']
    });
    let text = world.createEntity()
        .addComponent(Renderable, new Renderable(basicText))
        .addComponent(Position, new Position(0,0));
    
    let graphics = new PIXI.Graphics();
    graphics.lineStyle(6, 0x33DDAC);
    graphics.drawCircle(0, 0, 7);
    graphics.endFill();
    let circle = world.createEntity()
        .addComponent(Renderable, new Renderable(graphics))
        .addComponent(Position, new Position(0,0))
        .addComponent(PFDestination, new Victor(11, 11))
        .addComponent(Human);

    let g2 = new PIXI.Graphics();
    g2.lineStyle(6, 0xE52E74);
    g2.drawCircle(0, 0, 7);
    g2.endFill();
    let c2 = world.createEntity()
        .addComponent(Renderable, new Renderable(g2))
        .addComponent(Position, new Position(0,0))
        .addComponent(PFDestination, new Victor(11, 11))
        .addComponent(Human);

    generateBuildings(world, singleton);

    var lastTime = performance.now();
    function update() {
        var time = performance.now();
        var delta = time - lastTime;
        lastTime = time;
        world.execute(delta);
        requestAnimationFrame(update);
    }

    update();
}

start_game();

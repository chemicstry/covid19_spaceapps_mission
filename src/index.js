import {World, System} from 'ecsy';
import {Grid, Renderable, Position, Destination} from './components.js';
import {Renderer, HumanMovementSystem, PositionUpdateSystem} from './systems.js';
import * as PIXI from 'pixi.js';

function start_game() {
    var world = new World();

    world
        .registerComponent(Destination)
        .registerComponent(Position)
        .registerSystem(HumanMovementSystem)
        .registerSystem(PositionUpdateSystem)
        .registerSystem(Renderer);

    // Singleton component (resources)
    world.createEntity()
        .addComponent(Grid, new Grid([10, 10], [500, 500]));
    
    const basicText = new PIXI.Text('Space Society Twente');
    basicText.x = 0;
    basicText.y = 0;
    basicText.style = new PIXI.TextStyle({
        fill: ['#ffffff', '#00ff99']
    });
    world.createEntity()
        .addComponent(Renderable, new Renderable(basicText))
        .addComponent(Position, new Position(0,0))
        .addComponent(Destination, new Destination(100,100));

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

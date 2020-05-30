import {World, System} from 'ecsy';
import {Grid, Renderable, Position, Destination, MovementPath} from './components.js';
import {Renderer, HumanMovementSystem, PositionUpdateSystem, DestinationMovementSystem, PathMovementSystem} from './systems.js';
import * as PIXI from 'pixi.js';
import Victor from 'victor';

function start_game() {
    var world = new World();

    world
        .registerSystem(PathMovementSystem)
        .registerSystem(DestinationMovementSystem)
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
        .addComponent(MovementPath, new MovementPath([new Victor(100, 0), new Victor(100, 50), new Victor(0, 50)]));

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

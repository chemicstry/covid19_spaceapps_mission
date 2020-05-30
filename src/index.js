import {World, System} from 'ecsy';
import {Movement, Circle, CanvasContext, DemoSettings, Intersecting} from './components.js';
import {MovementSystem, Renderer, IntersectionSystem} from './systems.js';
import {random} from './utils.js';

var world = new World();

world
    .registerComponent(Circle)
    .registerComponent(Movement)
    .registerComponent(Intersecting)
    .registerSystem(MovementSystem)
    .registerSystem(Renderer)
    .registerSystem(IntersectionSystem);

// Used for singleton components
var singletonEntity = world.createEntity()
    .addComponent(CanvasContext)
    .addComponent(DemoSettings);

var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var canvasComponent = singletonEntity.getMutableComponent(CanvasContext);
canvasComponent.ctx = canvas.getContext("2d");
canvasComponent.width = canvas.width;
canvasComponent.height = canvas.height;

for (var i = 0; i < 30; i++) {
    var entity = world
        .createEntity()
        .addComponent(Circle)
        .addComponent(Movement);

    var circle = entity.getMutableComponent(Circle);
    circle.position.set(random(0, canvas.width), random(0, canvas.height), 0);
    circle.radius = random(20, 100);

    var movement = entity.getMutableComponent(Movement);
    movement.velocity.set(random(-20, 20), random(-20, 20), 0);
}

window.world = world;
window.Circle = Circle;
window.Movement = Movement;

window.addEventListener( 'resize', () => {
    canvasComponent.width = canvas.width = window.innerWidth
    canvasComponent.height = canvas.height = window.innerHeight;
}, false );

var lastTime = performance.now();
function update() {
    var time = performance.now();
    var delta = time - lastTime;
    lastTime = time;
    world.execute(delta);
    requestAnimationFrame(update);
}

update();

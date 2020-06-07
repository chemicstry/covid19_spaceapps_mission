import { BuildingDefinition, BuildingRegistry } from 'components/buildings';
import { Grid, WalkableGrid } from 'components/grid';
import { Human, Schedule, Event } from 'components/human';
import { Infected } from 'components/infection';
import { Selected } from 'components/interraction';
import { Position } from 'components/movement';
import { Renderable } from 'components/rendering';
import { World } from 'ecsy';
import * as PIXI from 'pixi.js';
import { TimeSystem } from 'systems/time';
import Victor from 'victor';
import { DestinationMovementSystem, PathMovementSystem } from 'systems/movement';
import { InfectionSpreadSystem, InfectionRevealSystem } from 'systems/infection';
import { PositionUpdateSystem, RenderingSystem } from 'systems/rendering';
import { HumanSchedulingSystem, HumanSpriteRenderingSystem, ScheduleDisplaySystem } from 'systems/human';
import { UIUpdateSystem } from 'systems/interraction';
import { Time, VaccineTime } from 'components/time';
import { randomInt } from 'utils/math';
import { HumanSchedulePoint } from './components/human';
import { uniqueNamesGenerator, starWars } from 'unique-names-generator';
const random = require('random');

function generateBuildings(world, singleton) {
    let grid = singleton.getComponent(Grid);
    let buildingRegistry = singleton.getComponent(BuildingRegistry);
    let size = grid.size.clone().divide(grid.major_step);

    let placed = [...Array(size.x)].map(_ => Array(size.y));

    // Finds empty random spot (a bit inefficient)
    function getRandomPos() {
        do {
            var x = randomInt(0, size.x);
            var y = randomInt(0, size.y);
        } while(placed[x][y])
        return new Victor(x, y);
    }

    const hospitalCount = 2;
    for (let i = 0; i < hospitalCount; i++) {
        let pos = getRandomPos();
        placed[pos.x][pos.y] = buildingRegistry.getByType(BuildingDefinition.Type.HOSPITAL)
    }

    const shopCount = 3;
    for (let i = 0; i < shopCount; i++) {
        let pos = getRandomPos();
        placed[pos.x][pos.y] = buildingRegistry.getByType(BuildingDefinition.Type.SHOP)
    }

    const parkCount = 3;
    for (let i = 0; i < parkCount; i++) {
        let pos = getRandomPos();
        placed[pos.x][pos.y] = buildingRegistry.getByType(BuildingDefinition.Type.PARK)
    }

    for (let x = 0; x < size.x; ++x) {
        for (let y = 0; y < size.y; ++y) {
            // Get already placed building, otherwise random house/office
            let building = placed[x][y];
            if (!building) {
                if (random.boolean())
                    building = buildingRegistry.getByType(BuildingDefinition.Type.OFFICE)
                else
                    building = buildingRegistry.getByType(BuildingDefinition.Type.HOME)
            }

            let sprite = building.createSprite();
            let pos = grid.fromMajor(new Victor(x, y));
            pos = pos.add(new Victor(grid.major_step.x, grid.major_step.y));
            world.createEntity()
                .addComponent(Renderable, new Renderable(sprite))
                .addComponent(Position, pos);
            
            // Generate list of grid tiles this building is placed on
            pos = grid.fromMajor(new Victor(x, y));
            for (let px = 0; px < 3; px++)
                for (let py = 0; py < 3; py++)
                    building.addPosition(grid.fromMinor(new Victor(px + 2, py + 2)).add(pos));
        }
    }

    // Shuffle all allocated positions so they are allocated randomly later
    for (const building of buildingRegistry.buildings)
        building.shufflePositions();
}

function createHuman(world, singleton, infected) {
    let buildingRegistry = singleton.getComponent(BuildingRegistry);
    let selected = singleton.getComponent(Selected);
    let schedule = new Schedule();
    schedule.repeat = 24 * 60 * 60 * 1000; // repeat every 24 hours
    let home = buildingRegistry.getByType(BuildingDefinition.Type.HOME).allocatePosition();
    let work = buildingRegistry.getByType(BuildingDefinition.Type.OFFICE).allocatePosition();
    let shop = buildingRegistry.getByType(BuildingDefinition.Type.SHOP).allocatePosition();
    let park = buildingRegistry.getByType(BuildingDefinition.Type.PARK).allocatePosition();

    let time_start_work = random.normal(7*60*60*1000, 2*60*60*1000)();
    let time_end_work = random.normal(17*60*60*1000, 2*60*60*1000)();
    let time_shop = time_end_work + random.normal(2*60*60*1000, 1*60*60*1000)();
    let time_home = time_shop + Math.max(random.normal(0.5*60*60*1000, 0.2*60*60*1000)(), 0.3*60*60*1000);

    schedule.events.push(new Event(
        Event.Type.GO_WORK,
        time_start_work,
        work,
    ));
    schedule.events.push(new Event(
        Event.Type.GO_PARK,
        time_end_work,
        park,
    ));
    schedule.events.push(new Event(
        Event.Type.GO_SHOPPING,
        time_shop,
        shop,
    ));
    schedule.events.push(new Event(
        Event.Type.GO_HOME,
        time_home,
        home,
    ));

    const name = uniqueNamesGenerator({
        dictionaries: [starWars],
        length: 1
    });

    let graphics = new PIXI.Graphics();

    let entity = world.createEntity()
        .addComponent(Renderable, new Renderable(graphics))
        .addComponent(Position, home)
        .addComponent(Schedule, schedule)
        .addComponent(Human, { name });
    
    if (infected)
        entity.addComponent(Infected, new Infected(0));

    let addEvents = (graphics) => {
        graphics.interactive = true;
        graphics.buttonMode = true; // show cursor
        graphics.on("pointerover", () => {
            graphics.zIndex = 1;
            graphics.scale.x = graphics.scale.x * 1.5;
            graphics.scale.y = graphics.scale.y * 1.5;
        });
        graphics.on("pointerout", () => {
            graphics.zIndex = -1;
            graphics.scale.x = graphics.scale.x / 1.5;
            graphics.scale.y = graphics.scale.y / 1.5;
        });
        graphics.on("click", (ev) => {
            ev.stopPropagation();
            selected.set(entity);
        });
        graphics.hitArea = new PIXI.Polygon([
            0, 10,
            -14, 0,
            0, -10,
            14, 0,
        ]);
    }

    graphics.scale.set(1.0, 1.0/0.6); // Fix isometry 
    graphics.rotation = -Math.PI / 4;
    graphics.zIndex = -1;
    addEvents(graphics);

    // Create renderable entity for each schedule point (x marks)
    for (const event of schedule.events) {
        let graphics = new PIXI.Graphics();
        graphics.zIndex = -1;
        addEvents(graphics);
        world.createEntity()
            .addComponent(Renderable, new Renderable(graphics))
            .addComponent(HumanSchedulePoint, { human: entity})
            .addComponent(Position, event.data);
    }
}

function start_game() {
    var world = new World();

    world
        .registerSystem(TimeSystem)
        .registerSystem(HumanSchedulingSystem)
        .registerSystem(DestinationMovementSystem)
        .registerSystem(PathMovementSystem)
        .registerSystem(InfectionSpreadSystem)
        .registerSystem(InfectionRevealSystem)
        .registerSystem(PositionUpdateSystem)
        .registerSystem(HumanSpriteRenderingSystem)
        .registerSystem(ScheduleDisplaySystem)
        .registerSystem(UIUpdateSystem)
        .registerSystem(RenderingSystem);

    let grid = new Grid(new Victor(140, 140), new Victor(20, 20), new Victor(700, 700));
    let walkableGrid = new WalkableGrid(grid);
    let buildingRegistry = new BuildingRegistry();

    // Singleton component (resources)
    let singleton = world.createEntity()
        .addComponent(Time)
        .addComponent(VaccineTime, {value: 2*24*60*60*1000})
        .addComponent(Grid, grid)
        .addComponent(WalkableGrid, walkableGrid)
        .addComponent(BuildingRegistry, buildingRegistry)
        .addComponent(Selected);
    
    // let graphics = new PIXI.Graphics();
    // graphics.lineStyle(6, 0x33DDAC);
    // graphics.drawCircle(0, 0, 7);
    // graphics.endFill();
    // let circle = world.createEntity()
    //     .addComponent(Renderable, new Renderable(graphics))
    //     .addComponent(Position, new Position(0,0))
    //     .addComponent(PFDestination, new Victor(11, 11))
    //     .addComponent(Human);

    // let g2 = new PIXI.Graphics();
    // g2.lineStyle(6, 0xE52E74);
    // g2.drawCircle(0, 0, 7);
    // g2.endFill();
    // let c2 = world.createEntity()
    //     .addComponent(Renderable, new Renderable(g2))
    //     .addComponent(Position, new Position(0,0))
    //     .addComponent(PFDestination, new Victor(11, 11))
    //     .addComponent(Human);

    generateBuildings(world, singleton);

    const infectedCount = 3;
    for (let i = 0; i < 27; ++i) {
        createHuman(world, singleton, i < infectedCount);
    }

    const maxDelta = 500;
    var lastTime = performance.now();
    function update() {
        var time = performance.now();
        var delta = time - lastTime;
        lastTime = time;

        // Cap delta and allow game to catch up when window was inactive for some time
        while(delta > 0) {
            let cappedDelta = Math.min(delta, maxDelta);
            world.execute(cappedDelta);
            delta -= cappedDelta;
        }
        
        requestAnimationFrame(update);
    }

    update();
}

start_game();

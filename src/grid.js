import Victor from "victor";
import { inRange } from "./utils";
import * as EasyStar from 'easystarjs';

// Game grid
export class Grid {
    constructor(major_step, minor_step, size) {
        this.major_step = major_step;
        this.minor_step = minor_step;
        this.size = size;
    }

    toMinor(pos) {
        return new Victor(
            Math.floor(pos.x / this.minor_step.x),
            Math.floor(pos.y / this.minor_step.y)
        )
    }

    fromMinor(pos) {
        return new Victor(
            (Math.floor(pos.x) + 0.5) * this.minor_step.x,
            (Math.floor(pos.y) + 0.5) * this.minor_step.y
        )
    }

    toMajor(pos) {
        return new Victor(
            Math.floor(pos.x / this.major_step.x),
            Math.floor(pos.y / this.major_step.y)
        )
    }

    fromMajor(pos) {
        return new Victor(
            Math.floor(pos.x) * this.major_step.x,
            Math.floor(pos.y) * this.major_step.y
        )
    }
}

// Game grid
export class WalkableGrid {
    static TileType = {
        BUILDING: 1,
        SIDEWALK: 2,
        STREET: 3,
        CROSSING: 4
    };

    static getTileType(grid, x, y) {
        let tiles_per_major_step = grid.major_step.clone().divide(grid.minor_step);

        x = x % tiles_per_major_step.x;
        y = y % tiles_per_major_step.x;

        if (inRange(x, 2, 4) && inRange(y, 2, 4))
            return WalkableGrid.TileType.BUILDING;
        else if (inRange(x, 1, 5) && inRange(y, 1, 5))
            return WalkableGrid.TileType.SIDEWALK;
        else if (x == 1 || x == 5 || y == 1 || y == 5)
            return WalkableGrid.TileType.CROSSING;
        else
            return WalkableGrid.TileType.STREET;
    }

    constructor(grid) {
        if (!grid)
            return;

        this.grid = grid;

        let size = grid.toMinor(grid.size);

        this.gridArray = [];
        for (let x = 0; x < size.x; ++x) {
            let row = [];
            for (let y = 0; y < size.y; ++y) {
                row.push(WalkableGrid.getTileType(grid, x, y));
            }
            this.gridArray.push(row);
        }

        // Pathfinding
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.gridArray);
        this.easystar.enableDiagonals();
        this.easystar.setTileCost(WalkableGrid.TileType.BUILDING, 10.0);
        this.easystar.setTileCost(WalkableGrid.TileType.SIDEWALK, 2.0);
        this.easystar.setAcceptableTiles([
            WalkableGrid.TileType.BUILDING,
            WalkableGrid.TileType.SIDEWALK,
            WalkableGrid.TileType.CROSSING,
            WalkableGrid.TileType.STREET,
        ]);
    }

    getPath(start, end, callback) {
        start = this.grid.toMinor(start);
        end = this.grid.toMinor(end);
        this.easystar.findPath(start.x, start.y, end.x, end.y, (path) => {
            callback(path ? path.map(p => this.grid.fromMinor(new Victor(p.x, p.y))) : null);
        });
        this.easystar.calculate();
    }
}

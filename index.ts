
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

enum TileType {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

enum Input {
  UP, DOWN, LEFT, RIGHT
}

interface Point {
  x: number;
  y: number;
}

interface Tile {
  type: TileType;
  color: string;
  canReplace: boolean;
  canFall: boolean;
}

const air: Tile = {
  type: TileType.AIR,
  color: '#ffffff',
  canReplace: true,
  canFall: false
}

const flux: Tile = {
  type: TileType.FLUX,
  color: '#ccffcc',
  canReplace: true,
  canFall: false
}

const unbreakable: Tile = {
  type: TileType.UNBREAKABLE,
  color: '#999999',
  canReplace: false,
  canFall: false
}

const player: Tile = {
  type: TileType.PLAYER,
  color: '#ff0000',
  canReplace: false,
  canFall: false
}

const stone: Tile = {
  type: TileType.STONE,
  color: '#0000cc',
  canReplace: false,
  canFall: false
}

const fallingStone: Tile = {
  type: TileType.STONE,
  color: '#0000cc',
  canReplace: false,
  canFall: true
}

const box: Tile = {
  type: TileType.BOX,
  color: '#8b4513',
  canReplace: false,
  canFall: false
}

const fallingBox: Tile = {
  type: TileType.BOX,
  color: '#8b4513',
  canReplace: false,
  canFall: true
}

const key: Tile = {
  type: TileType.KEY1,
  color: '#ffcc00',
  canReplace: true,
  canFall: false,
}

const lock: Tile = {
  type: TileType.LOCK1,
  color: '#ffcc00',
  canReplace: false,
  canFall: false,
}

class MapController {

  map: Tile[][];
  playerPoint: Point;
  isKeyLock: boolean;

  constructor(map: Tile[][]) {
    this.map = map;
    this.playerPoint = this.findPlayerPoint();
    this.isKeyLock = true;
  }

  movePlayer(target: Point) {
    const cur: Point = this.playerPoint;
    const tileAtTarget = this.getTile(target);
    if (tileAtTarget.canReplace) {
      if (tileAtTarget.type === TileType.KEY1) {
        this.isKeyLock = false;
      }
      const sucess = this.setTile(target, player);
      if (sucess) {
        this.playerPoint = target;
        this.remove(cur);
      }
    }
  }

  movePlayerUp() {
    const cur: Point = this.playerPoint;
    const target: Point = { x: cur.x - 1, y: cur.y };
    this.movePlayer(target);
  }

  movePlayerDown() {
    const cur: Point = this.playerPoint;
    const target: Point = { x: cur.x + 1, y: cur.y };
    this.movePlayer(target);
  }

  movePlayerLeft() {
    const cur: Point = this.playerPoint;
    const target: Point = { x: cur.x, y: cur.y - 1 };
    this.movePlayer(target);
  }

  movePlayerRight() {
    const cur: Point = this.playerPoint;
    const target: Point = { x: cur.x, y: cur.y + 1 };
    this.movePlayer(target);
  }

  getTile(p: Point): Tile {
    try {
      return this.map[p.x][p.y];
    } catch (error) {
      return null;
    }
  }

  setTile(p: Point, tile: Tile): boolean {
    try {
      this.map[p.x][p.y] = tile;
    } catch {
      return false;
    }
    return true;
  }

  remove(p: Point) {
    this.map[p.x][p.y] = air;
  }

  findPlayerPoint(): Point {
    let point: Point;
    this.loop2DMap((x, y) => {
      if (this.map[x][y].type === TileType.PLAYER) {
        point = {x: x,y: y};
      }
    });
    return point;
  }

  falling(current: Point) {
    const belowPoint: Point = {x: current.x + 1, y: current.y } ;
    const tile = this.getTile(current);
    const belowTile = this.getTile(belowPoint);

    if (tile && belowTile && tile.canFall && belowTile.type === TileType.AIR) {
      const success = this.setTile(belowPoint, tile);
      if (success) {
        this.remove(current);
      }
    }
  }

  unlock(current: Point) {
    if (this.isKeyLock === false && this.getTile(current).type === TileType.LOCK1) {
      this.remove(current);
    }
  }

  updateMap() {
    this.loop2DMap((x, y) => {
      this.falling({x: x, y: y});
      this.unlock({x: x, y: y});
    });
  }

  loop2DMap(func: (x: number, y: number, tile?: Tile) => void) {
    for (let x = 0; x < this.map.length; x++) {
      for (let y = 0; y < this.map[x].length; y++) {
        func(x, y, map[x][y]);
      }
    }
  }
  
}

let map: Tile[][] = [
  [unbreakable, unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable],
  [unbreakable, player,       air,          flux,         flux,         unbreakable,  air,          unbreakable],
  [unbreakable, fallingStone, unbreakable,  fallingBox,   flux,         unbreakable,  air,          unbreakable],
  [unbreakable, key,          fallingStone, flux,         flux,         unbreakable,  air,          unbreakable],
  [unbreakable, fallingStone, flux,         flux,         flux,         lock,         air,          unbreakable],
  [unbreakable, unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable,  unbreakable],
];

let mapController = new MapController(map)

let inputs: Input[] = [];

function updateUserInputs() {
  while (inputs.length > 0) {
    let current = inputs.pop();

    if (current === Input.LEFT) {
      mapController.movePlayerLeft();
    }
    else if (current === Input.RIGHT) {
      mapController.movePlayerRight();
    }
    else if (current === Input.UP) {
      mapController.movePlayerUp();
    }
    else if (current === Input.DOWN) {
      mapController.movePlayerDown();
    }

    mapController.updateMap();
  }
}

function draw() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  mapController.loop2DMap((x, y, tile) => {
    g.fillStyle = tile.color;
    g.fillRect(y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });
}

function gameLoop() {
  const before = Date.now();
  updateUserInputs();
  draw();
  const after = Date.now();
  const frameTime = after - before;
  const sleep = SLEEP - frameTime;
  setTimeout(gameLoop, sleep);
}

window.onload = () => {
  gameLoop();
}

window.addEventListener("keydown", e => {
  if (e.keyCode === LEFT_KEY || e.key === "a") inputs.push(Input.LEFT);
  else if (e.keyCode === UP_KEY || e.key === "w") inputs.push(Input.UP);
  else if (e.keyCode === RIGHT_KEY || e.key === "d") inputs.push(Input.RIGHT);
  else if (e.keyCode === DOWN_KEY || e.key === "s") inputs.push(Input.DOWN);
});


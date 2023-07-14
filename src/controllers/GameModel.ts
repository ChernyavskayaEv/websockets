import { ShipData, Point } from '../constants.js';

const getLine = (length: number, start: number) =>
  Array.from(Array(length), (v, i) => start + i);

export class Ship {
  position: Point;
  direction: boolean;
  length: number;
  type?: string;
  killed?: boolean;

  constructor({position, direction, length }: ShipData) {
    this.position = position;
    this.direction = direction;
    this.length = length;
  }

  get coordinates(): Point[] {
    const { x, y } = this.position;
    const point = this.direction ? x : y;
    const startLine = this.direction ? y : x;
    const line = getLine(this.length, startLine);
    const coordinates = this.direction
      ? line.map(c => ({x: point, y: c }))
      : line.map(c => ({y: point, x: c }))
    return coordinates;
  }
}

export class Game {
  ships: Ship[];
  field: Array<Array<'miss' | 'hit' | 'killed' | null>> = Array.from(
    Array(10),
    (x) => Array.from(Array(10), (x) => null)
  );

  constructor(ships: ShipData[]) {
    this.ships = ships.map( ship => new Ship(ship));
  }

  checkAllShips(): boolean {
    return this.ships.every( ship => ship.killed );
  }

  getShip({ x, y }: Point): Ship | undefined {
    return this.ships.find(
      (sh) =>
        (sh.position.x == x && sh.position.y == y) ||
        (sh.direction
          ? sh.position.x == x &&
            Array.from(Array(sh.length), (s, i) => sh.position.y + i).includes(
              y
            )
          : Array.from(Array(sh.length), (s, i) => sh.position.x + i).includes(
              x
            ) && sh.position.y == y)
    );
  }

  checkShot(shot: Point): 'miss' | 'hit' | 'killed' {
    const ship = this.getShip(shot);
    if (!ship) return 'miss';
    return 'hit';
  }

  fillField(shot: Point): 'miss' | 'hit' | 'killed' {
    const { x, y } = shot;
    const result = this.checkShot(shot);
    this.field[y][x] = result;
    return result;
  }

  getFieldValue(point: Point): string | null {
    return this.field[point.y][point.x];
  }

  checkShip(ship: Ship): boolean {
    return ship.coordinates.every( p => this.getFieldValue(p) === 'hit')
 }

  getAround(ship: Ship): Point[] {
    const { x, y } = ship.position;
    const point = ship.direction ? x : y;
    const startLine = ship.direction ? y : x;
    const line = getLine(ship.length, startLine);
    const extLine = [startLine - 1].concat(line);
    extLine.push(startLine + ship.length);
    const border = [];
    for (const j of extLine) {
      for (const i of [point + 1, point, point - 1]) {
        if (i == point && line.includes(j)) continue;
        border.push(!ship.direction ? { x: j, y: i } : { x: i, y: j });
      }
    }

    return border.filter(({ x, y }) => x >= 0 && x <= 9 && y >= 0 && y <= 9);
  }

  handleAttack(shot: Point): Point[][] | undefined {
    const res = this.fillField(shot);
    if (res == 'miss') return;
    const ship = this.getShip(shot);

    if (this.checkShip(ship!)) {
      ship!.killed = true;
      return [ship!.coordinates, this.getAround(ship!)];
    }
  }
}

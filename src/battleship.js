export class Player {
  constructor(isComputer = false) {
    this.gameboard = new Gameboard();
    this.isComputer = isComputer;
  }

  attack(opponentGameboard, x = null, y = null) {
    if (this.isComputer) {
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (opponentGameboard.attackedCells.has(`${x},${y}`));
    }
    return opponentGameboard.receiveAttack(x, y);
  }
}

export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.missedAttacks = [];
    this.attackedCells = new Set();
  }

  placeShip(ship, x, y, isHorizontal) {
    const positions = [];
    if (isHorizontal) {
      for (let i = 0; i < ship.length; i++) {
        const newX = x + i;
        if (newX >= 10 || this.grid[y][newX] !== null) return false;
        positions.push({ x: newX, y });
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        const newY = y + i;
        if (newY >= 10 || this.grid[newY][x] !== null) return false;
        positions.push({ x, y: newY });
      }
    }
    positions.forEach((pos) => {
      this.grid[pos.y][pos.x] = ship;
    });
    this.ships.push(ship);
    return true;
  }

  receiveAttack(x, y) {
    const key = `${x},${y}`;

    if (x < 0 || x >= 10 || y < 0 || y >= 10 || this.attackedCells.has(key)) {
      return { valid: false };
    }
    this.attackedCells.add(key);
    const target = this.grid[y][x];
    if (target) {
      target.hit();
      return { valid: true, result: "hit" };
    } else {
      this.missedAttacks.push({ x, y });
      return { valid: true, result: "miss" };
    }
  }

  allSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}

export class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
  }

  hit() {
    if (this.hits < this.length) {
      this.hits++;
    }
  }

  isSunk() {
    return this.hits >= this.length;
  }
}

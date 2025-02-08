import { Ship, Gameboard, Player } from "./battleship.js";
import "./styles.css";

class GameUI {
  constructor() {
    this.player = new Player();
    this.computer = new Player(true);
    this.currentPlayer = null;
    this.isHorizontal = true;
    this.shipLengths = [5, 4, 3, 3, 2];
    this.currentShipIndex = 0;
    this.gamePhase = "setup";

    this.rotateBtn = document.getElementById("rotate-btn");
    this.resetBtn = document.getElementById("reset-btn");
    this.messageEl = document.getElementById("message");
    this.playerBoardEl = document.getElementById("player-board");
    this.computerBoardEl = document.getElementById("computer-board");

    this.initializeEventListeners();
    this.startNewGame();
  }

  startNewGame() {
    this.player.gameboard = new Gameboard();
    this.computer.gameboard = new Gameboard();
    this.currentShipIndex = 0;
    this.gamePhase = "setup";
    this.messageEl.textContent =
      "Place your ships! Click on your board to place ships.";
    this.renderBoards();
    this.placeComputerShips();
    this.createBoard(this.playerBoardEl, this.player.gameboard, true);
    this.createBoard(this.computerBoardEl, this.computer.gameboard, false);
  }

  placeComputerShips() {
    const lengths = [5, 4, 3, 3, 2];
    lengths.forEach((length) => {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() < 0.5;
        placed = this.computer.gameboard.placeShip(
          new Ship(length),
          x,
          y,
          isHorizontal
        );
      }
    });
  }

  initializeEventListeners() {
    this.rotateBtn.addEventListener("click", () => {
      this.isHorizontal = !this.isHorizontal;
      this.rotateBtn.textContent = `Rotate Ship (${this.isHorizontal ? "Horizontal" : "Vertical"})`;
    });

    this.resetBtn.addEventListener("click", () => this.startNewGame());

    this.playerBoardEl.addEventListener("click", (e) => {
      if (!e.target.classList.contains("cell") || this.gamePhase !== "setup")
        return;
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      this.placePlayerShip(x, y);
    });

    this.computerBoardEl.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("cell") ||
        this.gamePhase !== "battle" ||
        this.currentPlayer === this.computer
      )
        return;
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      this.handleAttack(x, y);
    });
  }

  placePlayerShip(x, y) {
    if (this.currentShipIndex >= this.shipLengths.length) return;

    const shipLength = this.shipLengths[this.currentShipIndex];
    const ship = new Ship(shipLength);
    const placed = this.player.gameboard.placeShip(
      ship,
      x,
      y,
      this.isHorizontal
    );

    if (placed) {
      this.currentShipIndex++;
      this.renderBoards();

      if (this.currentShipIndex < this.shipLengths.length) {
        this.messageEl.textContent = `Place your ship of length ${this.shipLengths[this.currentShipIndex]}.`;
      } else {
        this.gamePhase = "battle";
        this.currentPlayer = this.player;
        this.messageEl.textContent =
          "All ships placed! Attack the computer's board!";
      }
    } else {
      this.messageEl.textContent = `Invalid placement! Please try placing a ship of length ${shipLength} at a different location.`;
    }
  }

  handleAttack(x, y) {
    if (this.currentPlayer !== this.player || this.gamePhase !== "battle")
      return;

    const attackFeedback = this.computer.gameboard.receiveAttack(x, y);
    if (!attackFeedback.valid) {
      this.messageEl.textContent =
        "Invalid move! You've already attacked that coordinate.";
      return;
    }

    this.renderBoards();

    if (this.computer.gameboard.allSunk()) {
      this.messageEl.textContent = "You won! All enemy ships sunk!";
      this.gamePhase = "ended";
      return;
    }

    if (attackFeedback.result === "hit") {
      this.messageEl.textContent = "Hit! Computer's turn.";
    } else if (attackFeedback.result === "miss") {
      this.messageEl.textContent = "Miss! Computer's turn.";
    }

    this.currentPlayer = this.computer;
    setTimeout(() => {
      if (this.gamePhase !== "ended") {
        this.computerTurn();
      }
    }, 1000);
  }

  computerTurn() {
    if (this.gamePhase === "ended") return;

    const attackFeedback = this.computer.attack(this.player.gameboard);
    this.renderBoards();

    if (this.player.gameboard.allSunk()) {
      this.messageEl.textContent = "Computer won! All your ships sunk!";
      this.gamePhase = "ended";
      return;
    }

    if (attackFeedback.result === "hit") {
      this.messageEl.textContent = "Computer hit your ship!";
    } else if (attackFeedback.result === "miss") {
      this.messageEl.textContent = "Computer missed!";
    }

    this.currentPlayer = this.player;
    setTimeout(() => {
      if (this.gamePhase !== "ended") {
        this.messageEl.textContent = "Your turn! Attack the computer's board!";
      }
    }, 1000);
    this.renderBoards();
  }

  createBoard(boardEl, gameboard, showShips) {
    boardEl.innerHTML = "";
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;

        const ship = gameboard.grid[y][x];
        const attacked = gameboard.attackedCells.has(`${x},${y}`);

        if (attacked) {
          cell.classList.add(ship ? "hit" : "miss");
        }

        if (ship && (showShips || ship.isSunk())) {
          cell.classList.add("ship");
          if (ship.isSunk()) {
            cell.classList.add("sunk");
          }
        }

        boardEl.appendChild(cell);
      }
    }
  }

  renderBoards() {
    this.createBoard(this.playerBoardEl, this.player.gameboard, true);
    this.createBoard(this.computerBoardEl, this.computer.gameboard, false);
  }
}

new GameUI();

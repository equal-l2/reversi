import { findLeastChoiseCell, findMostProfitableCell } from "./strategy.js";

class AbstractPlayer {
  constructor(stone, isHuman, name) {
    this.stone = stone;
    this.isHuman = isHuman;
    this.name = name;
  }
}

class Player extends AbstractPlayer {
  constructor(stone) {
    super(stone, true, "Player");
  }
}

class AbstractComputer extends AbstractPlayer {
  constructor(stone, name) {
    super(stone, false, name);
  }

  chooseCell(_board) {
    throw new Error("Abstract method chooseCell is not implemented");
  }
}

class GreedyComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Greedy Computer");
    this.stepsToLook = 1; // TODO: multistep inference
  }

  chooseCell(board) {
    return findMostProfitableCell(board, this.stone, this.stepsToLook);
  }
}

class SmartComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Smart Computer");
    this.stepsToLook = 1; // TODO: multistep inference
  }

  chooseCell(board) {
    return findLeastChoiseCell(board, this.stone, this.stepsToLook);
  }
}

class KadoComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Kado Computer");
    this.stepsToLook = 1; // TODO: multistep inference
  }

  chooseCell(board) {
    const cells = board.getPlaceable(this.stone);

    // Choose Kado if possible
    for (const cell of cells) {
      for (const loc of board.getKados()) {
        if (cell[0] == loc[0] && cell[1] == loc[1]) {
          return cell;
        }
      }
    }

    // TODO: Avoid around open Kado
    // TODO: Consider edge

    return findMostProfitableCell(board, this.stone, this.stepsToLook);
  }
}

class RandomComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Random Computer");
  }

  chooseCell(board) {
    const cells = board.getPlaceable(this.stone);
    return cells[Math.trunc(Math.random() * cells.length)];
  }
}

const playerClasses = [Player, GreedyComputer, SmartComputer, KadoComputer, RandomComputer];

function getPlayerObj(i, myStone) {
  if (i < 0 || i >= playerClasses.length) {
    throw new Error("Invalid player identifier");
  }

  return new playerClasses[i](myStone);
}

export const playerNames = playerClasses.map((c) => c.name);

export default getPlayerObj;

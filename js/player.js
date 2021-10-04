import { flipped } from "./board.js";

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

const StepsToLook = 1;

if (StepsToLook <= 0) {
  throw new Error("StepsToLook must be positive");
}

function getAllHands(steps, board, stone) {
  const cells = board.getPlaceable(stone);
  if (cells.length === 0) {
    const newSteps = [...steps, [-1, -1]];
    return [[newSteps, board]];
  } else {
    return cells.map((c) => {
      const b = board.clone();
      b.placeStone(c[0], c[1], stone);
      const step = [c[0], c[1]];
      const newSteps = [...steps, step];
      return [newSteps, b];
    });
  }
}

function getBoards(orig, stone) {
  let boards = [[[], orig]];
  let n = StepsToLook;
  while (true) {
    boards = boards
      .map((b) => {
        const steps = b[0];
        const board = b[1];
        return getAllHands(steps, board, stone);
      })
      .flat();

    n -= 1;

    if (n > 0) {
      // enumerate all hand of the opponent
      const oppo = flipped(stone);
      boards = boards
        .map((b) => {
          const steps = b[0];
          const board = b[1];
          return getAllHands(steps, board, oppo);
        })
        .flat();
    } else {
      break;
    }
  }
  return boards;
}

class GreedyComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Greedy Computer");
  }

  chooseCell(board) {
    const boards = getBoards(board, this.stone);

    // find the cell that yields the most stones
    let most = [0, [0, 0]]; // [<stones>, <cell>]
    for (let b of boards) {
      let count = b[1].count()[this.stone];
      if (count > most[0]) {
        most = [count, b[0][0]];
      }
    }
    return most[1];
  }
}

class SmartComputer extends AbstractComputer {
  constructor(stone) {
    super(stone, "Smart Computer");
  }

  chooseCell(board) {
    const boards = getBoards(board, this.stone);
    // select the cell that the opponent will have least choises.
    let least = [Infinity, 0, [0, 0]]; // [<choises>, <my stones>, <cell>]

    for (let b of boards) {
      let count = b[1].count()[this.stone];
      let choise = b[1].getPlaceable(this.stone).length;
      if (choise < least[0] || (choise === least[0] && count > least[1])) {
        least = [choise, count, b[0][0]];
      }
    }

    return least[2];
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

function getPlayerObj(i, myStone) {
  switch (i) {
    case 0:
      return new Player(myStone);
    case 1:
      return new GreedyComputer(myStone);
    case 2:
      return new SmartComputer(myStone);
    case 3:
      return new RandomComputer(myStone);
    default:
      return null;
  }
}

export const playerNames = [
  "Player",
  "Greedy Computer",
  "Smart Computer",
  "Random Computer",
];

export default getPlayerObj;

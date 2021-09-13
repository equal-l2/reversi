class AbstractPlayer {
  constructor(stone, isHuman) {
    this.stone = stone;
    this.isHuman = isHuman;
  }
}

class Player extends AbstractPlayer {
  name = "Player";
  constructor(stone) {
    super(stone, true);
  }
}

class AbstractComputer extends AbstractPlayer {
  constructor(stone) {
    super(stone, false);
  }

  chooseCell(_board) {
    throw new Error("Abstract method letPlace is not implemented");
  }
}

class GreedyComputer extends AbstractComputer {
  chooseCell(board) {
    const cells = board.getPlaceable(this.stone);
    // find the cell that yields the most stones
    let most = [0, [0, 0, ""]]; // [<stones>, <cell>]
    for (let cell of cells) {
      let board_copy = board.clone();
      board_copy.placeStone(cell[0], cell[1], this.stone);
      let count = board_copy.count()[this.stone];
      if (count > most[0]) {
        most[0] = count;
        most[1] = cell;
      }
    }
    return most[1];
  }
}

class SmartComputer extends AbstractComputer {
  chooseCell(board) {
    const cells = board.getPlaceable(this.stone);
    // select the cell that the opponent will have least choises.
    let least = [Infinity, 0, [0, 0, ""]]; // [<choises>, <my stones>, <cell>]
    for (let cell of cells) {
      let board_copy = board.clone();
      board_copy.placeStone(cell[0], cell[1], this.stone);
      let choise = board_copy.getPlaceable(this.stone).length;
      let count = board_copy.count()[this.stone];
      if (choise <= least[0] && count > least[1]) {
        least = [choise, count, cell];
      }
    }
    return least[2];
  }
}

class RandomComputer extends AbstractComputer {
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

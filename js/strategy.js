
import { flipped } from "./board.js";

export function getAllHands(steps, board, stone) {
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

export function getBoards(orig, stone, stepsToLook) {
  let boards = [[[], orig]];
  let n = stepsToLook;
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

export function findMostProfitableCell(board, stone, stepsToLook) {
    const boards = getBoards(board, stone, stepsToLook);

    // find the cell that yields the most stones
    let most = [0, [0, 0]]; // [<stones>, <cell>]
    for (let b of boards) {
      let count = b[1].count()[stone];
      if (count > most[0]) {
        most = [count, b[0][0]];
      }
    }
    return most[1];
}

export function findLeastChoiseCell(board, stone, stepsToLook) {
    const boards = getBoards(board, stone, stepsToLook);
    // select the cell that the opponent will have least choises.
    let least = [Infinity, 0, [0, 0]]; // [<choises>, <my stones>, <cell>]

    for (let b of boards) {
      let count = b[1].count()[stone];
      let choise = b[1].getPlaceable(stone).length;
      if (choise < least[0] || (choise === least[0] && count > least[1])) {
        least = [choise, count, b[0][0]];
      }
    }

    return least[2];
}


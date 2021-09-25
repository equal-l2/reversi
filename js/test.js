import { flipped, Board } from "./board.js";
import getPlayerObj, { playerNames } from "./player.js";

function runGame(players) {
  const fieldWidth = 8;
  const fieldHeight = 8;

  const board = new Board(fieldWidth, fieldHeight);
  board.placeCanonicalStones();

  let current = 0;
  while (true) {
    current = flipped(current);

    let ps = board.getPlaceable(current);
    if (ps.length === 0) {
      // no hands, skipped
      current = flipped(current);
      ps = board.getPlaceable(current);
      if (ps.length === 0) {
        return board.count();
      }
    }

    let [row, col] = players[current].chooseCell(board);
    if (board.canFlipStone(row, col, current)) {
      board.placeStone(row, col, current);
    } else {
      throw new Error("Invalid hand was chosen: ", row, col);
    }
  }
}

function runTest() {
  const selector = document.getElementById("player-choose");
  const chosen = selector.options[selector.selectedIndex];
  let players = [null, null, null];
  players[1] = getPlayerObj(3, 1); // random player
  players[2] = getPlayerObj(Number(chosen.value), 2);
  if (players[2].isHuman) {
    throw new Error("Only non-human players can be tested");
  }

  let wins = [0, 0];
  for (let i = 0; i < 1000; i++) {
    const cnts = runGame(players);
    if (cnts[1] > cnts[2]) {
      wins[0]++;
    } else if (cnts[1] < cnts[2]) {
      wins[1]++;
    }
  }

  document.getElementById("result").innerText = `Random ${wins[0]} / Target ${wins[1]}`;
}

function initPage() {
  document.getElementById("run-button").onclick = runTest;

  // generate selectors
  const selector = document.getElementById("player-choose");
  for (let i = 0; i < playerNames.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = playerNames[i];
    selector.add(option);
  }
}

window.addEventListener("load", initPage);

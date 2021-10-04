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
  document.getElementById("result").innerText = "Running...";
  document.getElementById("elapsed").innerText = "";

  setTimeout(() => {
    const selector = document.getElementById("player-choose");
    const playerChosen = Number.parseInt(
      selector.options[selector.selectedIndex].value
    );
    const colorChosen = Number.parseInt(
      document.querySelector("input:checked").value
    );
    let players = [null, null, null];
    players[colorChosen] = getPlayerObj(playerChosen, colorChosen);
    if (players[colorChosen].isHuman) {
      throw new Error("Only non-human players can be tested");
    }
    players[flipped(colorChosen)] = getPlayerObj(3, flipped(colorChosen)); // random player

    let wins = [0, 0];
    const iter = Number.parseInt(document.getElementById("iter").value);
    const start = performance.now();
    for (let i = 0; i < iter; i++) {
      const cnts = runGame(players);
      if (cnts[1] > cnts[2]) {
        wins[0]++;
      } else if (cnts[1] < cnts[2]) {
        wins[1]++;
      }
    }
    const end = performance.now();

    document.getElementById(
      "result"
    ).innerText = `${players[1].name} ${wins[0]} / ${players[2].name} ${wins[1]}`;
    document.getElementById("elapsed").innerText = `Elapsed time: ${
      end - start
    } [ms]`;
  }, 10);
}

function initPage() {
  document.getElementById("run-button").onclick = runTest;

  // generate selectors
  const selector = document.getElementById("player-choose");
  for (let i = 1; i < playerNames.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = playerNames[i];
    selector.add(option);
  }
}

window.addEventListener("load", initPage);

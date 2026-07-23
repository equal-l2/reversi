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
    const selector1 = document.getElementById("player1-choose");
    const selector2 = document.getElementById("player2-choose");

    const playerChosen1 = Number.parseInt(selector1.options[selector1.selectedIndex].value);
    const playerChosen2 = Number.parseInt(selector2.options[selector2.selectedIndex].value);
    let players = [null, getPlayerObj(playerChosen1, 1), getPlayerObj(playerChosen2, 2)];

    if (players.some((p) => p?.isHuman)) {
      throw new Error("Only non-human players can be used for testing");
    }

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

    const line1 = `${players[1].name} ${wins[0]} / ${players[2].name} ${wins[1]}`;
    const line2 = `(${Math.trunc((100 * wins[0]) / iter)}% / ${Math.trunc((100 * wins[1]) / iter)}%)`;

    document.getElementById("result").innerText = `${line1}\n${line2}`;
    document.getElementById("elapsed").innerText = `Elapsed time: ${end - start} [ms]`;
  }, 10);
}

function initPage() {
  document.getElementById("run-button").onclick = runTest;

  // generate selectors
  const selectors = [
    document.getElementById("player1-choose"),
    document.getElementById("player2-choose"),
  ];
  for (const sel of selectors) {
    for (let i = 1; i < playerNames.length; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = playerNames[i];
      sel.add(option);
    }
  }
}

window.addEventListener("load", initPage);

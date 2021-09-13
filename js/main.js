import { flipped, Board } from "./board.js";
import getPlayerObj, { playerNames } from "./player.js";

const wait = 50; // [ms]
const fieldWidth = 8;
const fieldHeight = 8;

const players = [null, null, null];

let current = 1;

function showStatus() {
  const bp = document.getElementById("black-stone");
  const wp = document.getElementById("white-stone");
  bp.classList.remove("placeable");
  wp.classList.remove("placeable");
  if (current == 1) {
    bp.classList.add("placeable");
  } else if (current === 2) {
    wp.classList.add("placeable");
  }

  const counts = board.count();
  const cnt1 = document.getElementById("black-count");
  const cnt2 = document.getElementById("white-count");
  cnt1.innerText = counts[1];
  cnt2.innerText = counts[2];
}

let board;

function getStoneSvg(state) {
  let colorStr = "red";
  switch (state) {
    case 0: {
      // None
      return '<svg class="stone"></svg>';
    }
    case 1: {
      colorStr = "black";
      break;
    }
    case 2: {
      colorStr = "white";
      break;
    }
  }
  return `
    <svg class="stone" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="0.2em" fill=${colorStr}>
    </svg>
    `;
}

function populateField() {
  const field = document.getElementById("field");
  field.innerHTML = "";

  for (let i = 0; i < board.height; i++) {
    const row = field.insertRow();
    for (let j = 0; j < board.width; j++) {
      const cell = row.insertCell();
      cell.innerHTML = getStoneSvg(board.read(i, j));
    }
  }
}

function showResult(show) {
  const result = document.getElementById("game-result");
  if (show) {
    document.getElementById("black-stone").classList.remove("placeable");
    document.getElementById("white-stone").classList.remove("placeable");

    const cnts = board.count();
    let text;
    let winner;
    if (cnts[1] > cnts[2]) {
      text = "Black Wins!!";
      winner = 1;
    } else if (cnts[1] === cnts[2]) {
      text = "Draw Game";
    } else if (cnts[1] < cnts[2]) {
      text = "White Wins!!";
      winner = 2;
    } else {
      text = "Error";
    }
    result.innerText = text;
    if (winner === 1) {
      document.getElementById("black-info").classList.add("placeable");
    } else if (winner === 2) {
      document.getElementById("white-info").classList.add("placeable");
    }
  } else {
    result.innerText = "";
    document.getElementById("black-info").classList.remove("placeable");
    document.getElementById("white-info").classList.remove("placeable");
  }
}

function nextTurn() {
  current = flipped(current);
  let ps = board.getPlaceable(current);
  if (ps.length === 0) {
    current = flipped(current);
    ps = board.getPlaceable(current);
    if (ps.length === 0) {
      showStatus();
      showResult(true);
      populateField();
      return;
    }
  }

  showStatus();
  populateField();
  if (players[current].isHuman) {
    renderPlaceable(ps);
  } else {
    const [row, col] = players[current].chooseCell(ps, board);
    setTimeout(() => clickCell(row, col), wait);
  }
}

function clickCell(row, col) {
  board.placeStone(row, col, current);
  nextTurn();
}

function renderPlaceable(ps) {
  const field = document.getElementById("field");
  for (const p of ps) {
    const [i, j, _] = p;
    const cell = field.rows[i].cells[j];
    cell.classList.add("placeable");
    //cell.innerHTML = txt;
    cell.onclick = (_) => {
      const rowIdx = cell.closest("tr").rowIndex;
      const colIdx = cell.closest("td").cellIndex;
      clickCell(rowIdx, colIdx);
    };
  }
}

function initBoard() {
  board = new Board(fieldWidth, fieldHeight);
  const halfH = Math.trunc(fieldHeight / 2);
  const halfW = Math.trunc(fieldWidth / 2);
  board.mutate(halfH - 1, halfW - 1, 1);
  board.mutate(halfH - 1, halfW, 2);
  board.mutate(halfH, halfW - 1, 2);
  board.mutate(halfH, halfW, 1);
}

function newGame() {
  initBoard();
  initPlayers();
  showResult(false);
  current = 0;
  nextTurn();
}

function initPlayers() {
  const list1 = document.getElementById("first");
  const list2 = document.getElementById("second");
  const chosen1 = list1.options[list1.selectedIndex];
  const chosen2 = list2.options[list2.selectedIndex];
  players[1] = getPlayerObj(Number(chosen1.value), 1);
  players[2] = getPlayerObj(Number(chosen2.value), 2);

  document.getElementById("black-player").innerText = chosen1.text;
  document.getElementById("white-player").innerText = chosen2.text;
}

function generateChooser() {
  const list1 = document.getElementById("first");
  const list2 = document.getElementById("second");

  for (let i = 0; i < playerNames.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = playerNames[i];
    list1.appendChild(option);
    list2.appendChild(option.cloneNode(true));
  }
}

function initPage() {
  document.getElementById("new-game").onclick = newGame;
  generateChooser();
  newGame();
}

window.addEventListener("load", initPage);

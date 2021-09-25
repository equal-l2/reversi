import { flipped, Board } from "./board.js";
import getPlayerObj, { playerNames } from "./player.js";

const wait = 0; // [ms]
const fieldWidth = 8;
const fieldHeight = 8;

const players = [null, null, null];

let current;

let placed;

const playLog = document.getElementById("log");
const blackSelect = document.getElementById("first");
const whiteSelect = document.getElementById("second");
const field = document.getElementById("field");
const blackStone = document.getElementById("black-stone");
const whiteStone = document.getElementById("white-stone");
const blackCount = document.getElementById("black-count");
const whiteCount = document.getElementById("white-count");

function showStatus() {
  blackStone.classList.remove("marked");
  whiteStone.classList.remove("marked");
  if (current == 1) {
    blackStone.classList.add("marked");
  } else if (current === 2) {
    whiteStone.classList.add("marked");
  }

  const counts = board.count();
  blackCount.innerText = counts[1];
  whiteCount.innerText = counts[2];
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
  field.replaceChildren();

  for (let i = 0; i < board.height; i++) {
    const row = field.insertRow();
    for (let j = 0; j < board.width; j++) {
      const cell = row.insertCell();
      cell.innerHTML = getStoneSvg(board.read(i, j));
    }
  }

  if (placed[0] != -1) {
    const [row, col] = placed;
    field.rows[row].cells[col].classList.add("placed");
  }
}

function showResult(show) {
  const gameResult = document.getElementById("game-result");
  const blackInfo = document.getElementById("black-info");
  const whiteInfo = document.getElementById("white-info");

  if (show) {
    blackStone.classList.remove("marked");
    whiteStone.classList.remove("marked");

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
    gameResult.innerText = text;
    if (winner === 1) {
      blackInfo.classList.add("marked");
    } else if (winner === 2) {
      whiteInfo.classList.add("marked");
    }
  } else {
    gameResult.innerText = "";
    blackInfo.classList.remove("marked");
    whiteInfo.classList.remove("marked");
  }
}

function nextTurn() {
  current = flipped(current);
  let ps = board.getPlaceable(current);
  if (ps.length === 0) {
    placed = [-1, -1];
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
    const [row, col] = players[current].chooseCell(board.clone());
    setTimeout(() => clickCell(row, col), wait);
  }
}

function genLog(row, col, stone) {
  let stoneStr;
  switch (stone) {
    case 1:
      stoneStr = "Black: ";
      break;
    case 2:
      stoneStr = "White: ";
      break;
    default:
      throw new Error("Unknown stone: " + stone);
  }
  const colCode = String.fromCharCode(65 + col);
  const rowCode = (row + 1).toString();
  return stoneStr + colCode + rowCode;
}

function addLog(row, col, stone) {
  let item = document.createElement("li");
  item.innerText = genLog(row, col, stone);
  playLog.appendChild(item);
  playLog.scrollTop = playLog.scrollHeight;
}

function clickCell(row, col) {
  addLog(row, col, current);
  board.placeStone(row, col, current);
  placed = [row, col];
  nextTurn();
}

function renderPlaceable(ps) {
  for (const p of ps) {
    const [i, j, _] = p;
    const cell = field.rows[i].cells[j];
    cell.classList.add("marked");
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
  placed = [-1, -1];
  playLog.replaceChildren();

  initBoard();
  initPlayers();
  showResult(false);
  current = 0;
  nextTurn();
}

function initPlayers() {
  const chosen1 = blackSelect.options[blackSelect.selectedIndex];
  const chosen2 = whiteSelect.options[whiteSelect.selectedIndex];
  players[1] = getPlayerObj(Number(chosen1.value), 1);
  players[2] = getPlayerObj(Number(chosen2.value), 2);

  document.getElementById("black-player").innerText = chosen1.text;
  document.getElementById("white-player").innerText = chosen2.text;
}

function initPage() {
  document.getElementById("new-game").onclick = newGame;

  // generate selectors
  for (let i = 0; i < playerNames.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = playerNames[i];
    blackSelect.add(option);
    whiteSelect.add(option.cloneNode(true));
  }

  // draw stones
  document.getElementById("black-stone").innerHTML = getStoneSvg(1);
  document.getElementById("white-stone").innerHTML = getStoneSvg(2);

  newGame();
}

window.addEventListener("load", initPage);

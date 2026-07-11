import { flipped, Board } from "./board.js";
import getPlayerObj, { playerNames } from "./player.js";

const fieldWidth = 8;
const fieldHeight = 8;

const players = [null, null, null];

let currentStone;

let locationToPlace;

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
  if (currentStone == 1) {
    blackStone.classList.add("marked");
  } else if (currentStone === 2) {
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

  if (locationToPlace[0] != -1) {
    const [row, col] = locationToPlace;
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
  currentStone = flipped(currentStone);
  let ps = board.getPlaceable(currentStone);
  if (ps.length === 0) {
    // no hands, skipped
    addLog(-1, -1, currentStone, true);
    locationToPlace = [-1, -1];
    currentStone = flipped(currentStone);
    ps = board.getPlaceable(currentStone);
    if (ps.length === 0) {
      showResult(true);
      return;
    }
  }

  if (players[currentStone].isHuman) {
    renderPlaceable(ps);
  } else {
    const [row, col] = players[currentStone].chooseCell(board.clone());
    if (board.canFlipStone(row, col, currentStone)) {
      setTimeout(() => clickCell(row, col), 0);
    } else {
      throw new Error("Invalid hand was chosen: ", row, col);
    }
  }
}

function addLog(row, col, stone, skip = false) {
  function genLog(row, col, stone, skip) {
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
    if (skip) {
      return stoneStr + "(skipped)";
    } else {
      const colCode = String.fromCharCode(65 + col);
      const rowCode = (row + 1).toString();
      return stoneStr + colCode + rowCode;
    }
  }

  let item = document.createElement("li");
  item.innerText = genLog(row, col, stone, skip);
  playLog.appendChild(item);
  playLog.scrollTop = playLog.scrollHeight;
}

function clickCell(row, col) {
  addLog(row, col, currentStone);
  board.placeStone(row, col, currentStone);
  locationToPlace = [row, col];
  showStatus();
  populateField();
  setTimeout(() => {
    nextTurn();
  }, 500);
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
  board.placeCanonicalStones();
}

function newGame() {
  locationToPlace = [-1, -1];
  playLog.replaceChildren();

  initBoard();
  initPlayers();
  showResult(false);
  currentStone = 0;
  showStatus();
  populateField();
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

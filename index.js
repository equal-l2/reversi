"use strict";

let wait = 100; // [ms]
let fieldWidth = 8;
let fieldHeight = 8;

let players = [null, null, null];

class AbstractPlayer {
  constructor(renderPlaceable, needsWait) {
    this.renderPlaceable = renderPlaceable;
    this.needsWait = needsWait;
  }
}

class Player extends AbstractPlayer {
  name = "Player";
  constructor() {
    super(true, true);
  }

  getName() {
    return "Player";
  }
}

class DumbComputer extends AbstractPlayer {
  constructor() {
    super(false, false);
  }

  letPlace(cells) {
    let chosen = cells[Math.floor(Math.random() * cells.length)];
    clickCell(...chosen);
  }

  getName() {
    return "Dumb Computer";
  }
}

class Board {
  constructor(width, height) {
    this._width = width;
    this._height = height;
    this.board = new Array(width)
      .fill(null) // for map (undefined won't work)
      .map(() => {
        return new Array(height).fill(0);
      });
  }

  mutate(row, col, value) {
    this.board[row][col] = value;
  }

  read(row, col) {
    return this.board[row][col];
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }

  count() {
    let counts = [0, 0, 0];
    for (let row of this.board) {
      for (let val of row) {
        counts[val] += 1;
      }
    }
    return counts;
  }
}

let current = 1;

function showStatus() {
  let bp = document.getElementById("black-stone");
  let wp = document.getElementById("white-stone");
  bp.classList.remove("placeable");
  wp.classList.remove("placeable");
  if (current == 1) {
    bp.classList.add("placeable");
  } else if (current === 2) {
    wp.classList.add("placeable");
  }

  let counts = board.count();
  let cnt1 = document.getElementById("black-count");
  let cnt2 = document.getElementById("white-count");
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
  let field = document.getElementById("field");
  field.innerHTML = "";

  for (let i = 0; i < fieldHeight; i++) {
    let row = field.insertRow();
    for (let j = 0; j < fieldWidth; j++) {
      let cell = row.insertCell();
      cell.innerHTML = getStoneSvg(board.read(i, j));
    }
  }
}

function showResult(show) {
  let result = document.getElementById("game-result");
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
  let ps = getPlaceable();
  if (ps.length === 0) {
    current = flipped(current);
    ps = getPlaceable();
    if (ps.length === 0) {
      showStatus();
      showResult(true);
      populateField();
      return;
    }
  }

  showStatus();
  populateField();
  if (players[current].renderPlaceable) {
    renderPlaceable(ps);
  }
  if (!players[current].needsWait) {
    let callback = players[current].letPlace;
    setTimeout(() => callback(ps), wait);
  }
}

function getPlaceable() {
  let ret = [];
  for (let i = 0; i < fieldHeight; i++) {
    for (let j = 0; j < fieldWidth; j++) {
      let txt = canFlipStone(i, j, current);
      if (txt !== "") {
        ret.push([i, j, txt]);
      }
    }
  }
  return ret;
}

function clickCell(row, col) {
  placeStone(row, col, current);
  nextTurn();
}

function renderPlaceable(ps) {
  let field = document.getElementById("field");
  for (let p of ps) {
    let [i, j, _] = p;
    let cell = field.rows[i].cells[j];
    cell.classList.add("placeable");
    //cell.innerHTML = txt;
    cell.onclick = (_) => {
      let rowIdx = cell.closest("tr").rowIndex;
      let colIdx = cell.closest("td").cellIndex;
      clickCell(rowIdx, colIdx);
    };
  }
}

function flipped(stone) {
  return (stone % 2) + 1; // 1 -> 2, 2 -> 1
}

function canFlipUp(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row - 1;
  let j = col;
  while (i > 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i - 1, j) === myStone) {
      return true;
    }
    i--;
  }
  return false;
}

function canFlipDown(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row + 1;
  let j = col;
  while (i < fieldHeight - 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i + 1, j) === myStone) {
      return true;
    }
    i++;
  }
  return false;
}

function canFlipLeft(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row;
  let j = col - 1;
  while (j > 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i, j - 1) === myStone) {
      return true;
    }
    j--;
  }
  return false;
}

function canFlipRight(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row;
  let j = col + 1;
  while (j < fieldHeight - 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i, j + 1) === myStone) {
      return true;
    }
    j++;
  }
  return false;
}

function canFlipUpLeft(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row - 1;
  let j = col - 1;
  while (i > 1 && j > 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i - 1, j - 1) === myStone) {
      return true;
    }
    i--;
    j--;
  }
  return false;
}

function canFlipUpRight(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row - 1;
  let j = col + 1;
  while (i > 1 && j < fieldHeight - 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i - 1, j + 1) === myStone) {
      return true;
    }
    i--;
    j++;
  }
  return false;
}

function canFlipDownLeft(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row + 1;
  let j = col - 1;
  while (i < fieldHeight - 1 && j > 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i + 1, j - 1) === myStone) {
      return true;
    }
    i++;
    j--;
  }
  return false;
}

function canFlipDownRight(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row + 1;
  let j = col + 1;
  while (i < fieldHeight - 1 && j < fieldHeight - 1) {
    if (board.read(i, j) !== oppo) break;
    if (board.read(i + 1, j + 1) === myStone) {
      return true;
    }
    i++;
    j++;
  }
  return false;
}

function canFlipStone(row, col, myStone) {
  if (board.read(row, col) !== 0) {
    return "";
  }

  let ret = "";
  if (canFlipUp(row, col, myStone)) {
    ret += "U";
  }
  if (canFlipDown(row, col, myStone)) {
    ret += "D";
  }
  if (canFlipLeft(row, col, myStone)) {
    ret += "L";
  }
  if (canFlipRight(row, col, myStone)) {
    ret += "R";
  }
  if (canFlipUpLeft(row, col, myStone)) {
    ret += "ul";
  }
  if (canFlipUpRight(row, col, myStone)) {
    ret += "ur";
  }
  if (canFlipDownLeft(row, col, myStone)) {
    ret += "dl";
  }
  if (canFlipDownRight(row, col, myStone)) {
    ret += "dr";
  }
  return ret;
}

function placeStone(row, col, myStone) {
  const oppo = flipped(myStone);
  board.mutate(row, col, myStone);

  if (canFlipUp(row, col, current)) {
    let i = row - 1;
    while (i > 0 && board.read(i, col) === oppo) {
      board.mutate(i, col, myStone);
      i--;
    }
  }
  if (canFlipDown(row, col, current)) {
    let i = row + 1;
    while (i < fieldHeight && board.read(i, col) === oppo) {
      board.mutate(i, col, myStone);
      i++;
    }
  }
  if (canFlipLeft(row, col, current)) {
    let j = col - 1;
    while (j > 0 && board.read(row, j) === oppo) {
      board.mutate(row, j, myStone);
      j--;
    }
  }
  if (canFlipRight(row, col, current)) {
    let j = col + 1;
    while (j < fieldWidth && board.read(row, j) === oppo) {
      board.mutate(row, j, myStone);
      j++;
    }
  }
  if (canFlipUpLeft(row, col, current)) {
    let i = row - 1;
    let j = col - 1;
    while (i > 0 && j > 0 && board.read(i, j) === oppo) {
      board.mutate(i, j, myStone);
      i--;
      j--;
    }
  }
  if (canFlipUpRight(row, col, current)) {
    let i = row - 1;
    let j = col + 1;
    while (i > 0 && j < fieldWidth && board.read(i, j) === oppo) {
      board.mutate(i, j, myStone);
      i--;
      j++;
    }
  }
  if (canFlipDownLeft(row, col, current)) {
    let i = row + 1;
    let j = col - 1;
    while (i < fieldHeight && j > 0 && board.read(i, j) === oppo) {
      board.mutate(i, j, myStone);
      i++;
      j--;
    }
  }
  if (canFlipDownRight(row, col, current)) {
    let i = row + 1;
    let j = col + 1;
    while (i < fieldHeight && j < fieldHeight && board.read(i, j) === oppo) {
      board.mutate(i, j, myStone);
      i++;
      j++;
    }
  }
}

function initBoard() {
  board = new Board(fieldWidth, fieldHeight);
  let halfH = Math.trunc(fieldHeight / 2);
  let halfW = Math.trunc(fieldWidth / 2);
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
  let list1 = document.getElementById("first");
  let list2 = document.getElementById("second");
  players[1] = getPlayerObj(Number(list1.value));
  players[2] = getPlayerObj(Number(list2.value));

  let name1 = document.getElementById("black-player");
  let name2 = document.getElementById("white-player");
  name1.innerText = players[1].getName();
  name2.innerText = players[2].getName();
}

function generateChooser() {
  let list1 = document.getElementById("first");
  let list2 = document.getElementById("second");

  let options = ["Player", "Dumb Computer"];
  for (let i = 0; i < options.length; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.text = options[i];
    list1.appendChild(option);
    list2.appendChild(option.cloneNode(true));
  }
}

function getPlayerObj(i) {
  switch (i) {
    case 0:
      return new Player();
    case 1:
      return new DumbComputer();
    default:
      return null;
  }
}

function initPage() {
  generateChooser();
  newGame();
}

window.addEventListener("load", initPage);

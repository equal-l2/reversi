'use strict'

let fieldWidth = 8;
let fieldHeight = 8;
let current = 1;

const board = new Array(fieldHeight)
                .fill(null) // for map (undefined won't work)
                .map(() => {
                  return new Array(fieldWidth).fill(0)
                });

function getStoneSvg(state) {
  let colorStr = 'red';
  switch (state) {
    case 0: { // None
      return '<svg class="stone"></svg>';
    }
    case 1: {
      colorStr = 'black';
      break;
    }
    case 2: {
      colorStr = 'white';
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
  let field = document.getElementById('field');
  field.innerHTML = '';

  for(let i = 0; i < fieldHeight; i++) {
    let row = field.insertRow();
    for(let j = 0; j < fieldWidth; j++) {
      let cell = row.insertCell();
      cell.innerHTML = getStoneSvg(board[i][j]);
      cell.onclick = (_) => {
        let rowIdx = cell.closest('tr').rowIndex;
        let colIdx = cell.closest('td').cellIndex;
        tryPlaceStone(rowIdx, colIdx);
      }
    }
  }
}

function flipped(stone) {
  return stone % 2 + 1; // 1 -> 2, 2 -> 1
}

function canFlipUp(row, col, myStone) {
  const oppo = flipped(myStone);
  let i = row - 1;
  let j = col;
  while (i > 1) {
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i-1][j] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i+1][j] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i][j-1] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i][j+1] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i-1][j-1] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i-1][j+1] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i+1][j-1] === myStone) {
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
    if (board[i][j] === 0) break;
    if (board[i][j] === oppo && board[i+1][j+1] === myStone) {
      return true;
    }
    i++;
    j++;
  }
  return false;
}

function canFlipStone(row, col, myStone) {
  return canFlipUp(row,col,myStone) ||
    canFlipDown(row,col,myStone) ||
    canFlipLeft(row,col,myStone) ||
    canFlipRight(row,col,myStone) ||
    canFlipUpLeft(row,col,myStone) ||
    canFlipUpRight(row,col,myStone) ||
    canFlipDownLeft(row,col,myStone) ||
    canFlipDownRight(row,col,myStone);
}

function placeStone(row, col, myStone) {
  const oppo = flipped(myStone);
  board[row][col] = myStone;

  if (canFlipUp(row, col, current)) {
    let i = row - 1;
    while(i > 0 && board[i][col] === oppo) {
      board[i][col] = myStone;
      i--;
    }
  }
  if (canFlipDown(row, col, current)) {
    let i = row + 1;
    while(i < fieldHeight && board[i][col] === oppo) {
      board[i][col] = myStone;
      i++;
    }
  }
  if (canFlipLeft(row, col, current)) {
    let j = col - 1;
    while(j > 0 && board[row][j] === oppo) {
      board[row][j] = myStone;
      j--;
    }
  }
  if (canFlipRight(row, col, current)) {
    let j = col + 1;
    while(j < fieldWidth && board[row][j] === oppo) {
      board[row][j] = myStone;
      j++;
    }
  }
  if (canFlipUpLeft(row, col, current)) {
    let i = row - 1;
    let j = col - 1;
    while(i > 0 && j > 0 && board[i][col] === oppo) {
      board[i][col] = myStone;
      i--;
      j--;
    }
  }
  if (canFlipUpRight(row, col, current)) {
    let i = row - 1;
    let j = col + 1;
    while(i > 0 && j < fieldWidth && board[i][col] === oppo) {
      board[i][col] = myStone;
      i--;
      j++;
    }
  }
  if (canFlipDownLeft(row, col, current)) {
    let i = row + 1;
    let j = col - 1;
    while(i < fieldHeight && j > 0 && board[i][col] === oppo) {
      board[i][col] = myStone;
      i++;
      j--;
    }
  }
  if (canFlipDownRight(row, col, current)) {
    let i = row + 1;
    let j = col + 1;
    while(i < fieldHeight && j < fieldHeight && board[i][col] === oppo) {
      board[i][col] = myStone;
      i++;
      j++;
    }
  }
}

function tryPlaceStone(row, col) {
  if (board[row][col] !== 0) {
    console.log("stone is already placed");
    return;
  }

  if (!canFlipStone(row, col, current)) {
    console.log("no stone will be flipped");
    return;
  }

  placeStone(row, col, current);
  current = flipped(current);
  populateField();
}

function initBoard() {
  board[fieldHeight/2-1][fieldWidth/2-1] = 1;
  board[fieldHeight/2-1][fieldWidth/2] = 2;
  board[fieldHeight/2][fieldWidth/2-1] = 2;
  board[fieldHeight/2][fieldWidth/2] = 1;

  populateField();
}

window.addEventListener('load', initBoard);

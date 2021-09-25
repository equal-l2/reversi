function flipped(stone) {
  return (stone % 2) + 1; // 1 -> 2, 2 -> 1
}

function validateState(state) {
  switch (state) {
    case 0:
    case 1:
    case 2:
      return state;
    default:
      throw new Error("Invalid value for board cell");
  }
}

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.board = new Array(width)
      .fill(null) // for map (undefined won't work)
      .map(() => {
        return new Array(height).fill(0);
      });
  }

  mutate(row, col, value) {
    this.board[row][col] = validateState(value);
  }

  read(row, col) {
    if (
      (0 <= row && row < this.height)
      && (0 <= col && col < this.width)
    ) {
      return this.board[row][col];
    } else {
      return null;
    }
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

  canFlipUp(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row - 1;
    let j = col;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i - 1, j) === myStone) {
        return true;
      }
      i--;
    }
    return false;
  }

  canFlipDown(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row + 1;
    let j = col;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i + 1, j) === myStone) {
        return true;
      }
      i++;
    }
    return false;
  }

  canFlipLeft(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row;
    let j = col - 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i, j - 1) === myStone) {
        return true;
      }
      j--;
    }
    return false;
  }

  canFlipRight(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row;
    let j = col + 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i, j + 1) === myStone) {
        return true;
      }
      j++;
    }
    return false;
  }

  canFlipUpLeft(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row - 1;
    let j = col - 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i - 1, j - 1) === myStone) {
        return true;
      }
      i--;
      j--;
    }
    return false;
  }

  canFlipUpRight(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row - 1;
    let j = col + 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i - 1, j + 1) === myStone) {
        return true;
      }
      i--;
      j++;
    }
    return false;
  }

  canFlipDownLeft(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row + 1;
    let j = col - 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i + 1, j - 1) === myStone) {
        return true;
      }
      i++;
      j--;
    }
    return false;
  }

  canFlipDownRight(row, col, myStone) {
    const oppo = flipped(myStone);
    let i = row + 1;
    let j = col + 1;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      if (this.read(i + 1, j + 1) === myStone) {
        return true;
      }
      i++;
      j++;
    }
    return false;
  }

  canFlipStone(row, col, myStone) {
    validateState(myStone);
    if (this.read(row, col) !== 0) {
      return "";
    }

    let ret = "";
    if (this.canFlipUp(row, col, myStone)) {
      ret += "U";
    }
    if (this.canFlipDown(row, col, myStone)) {
      ret += "D";
    }
    if (this.canFlipLeft(row, col, myStone)) {
      ret += "L";
    }
    if (this.canFlipRight(row, col, myStone)) {
      ret += "R";
    }
    if (this.canFlipUpLeft(row, col, myStone)) {
      ret += "ul";
    }
    if (this.canFlipUpRight(row, col, myStone)) {
      ret += "ur";
    }
    if (this.canFlipDownLeft(row, col, myStone)) {
      ret += "dl";
    }
    if (this.canFlipDownRight(row, col, myStone)) {
      ret += "dr";
    }
    return ret;
  }

  placeStone(row, col, myStone) {
    const oppo = flipped(myStone);
    this.mutate(row, col, myStone);

    if (this.canFlipUp(row, col, myStone)) {
      let i = row - 1;
      while (i > 0 && this.read(i, col) === oppo) {
        this.mutate(i, col, myStone);
        i--;
      }
    }
    if (this.canFlipDown(row, col, myStone)) {
      let i = row + 1;
      while (i < this.height && this.read(i, col) === oppo) {
        this.mutate(i, col, myStone);
        i++;
      }
    }
    if (this.canFlipLeft(row, col, myStone)) {
      let j = col - 1;
      while (j > 0 && this.read(row, j) === oppo) {
        this.mutate(row, j, myStone);
        j--;
      }
    }
    if (this.canFlipRight(row, col, myStone)) {
      let j = col + 1;
      while (j < this.width && this.read(row, j) === oppo) {
        this.mutate(row, j, myStone);
        j++;
      }
    }
    if (this.canFlipUpLeft(row, col, myStone)) {
      let i = row - 1;
      let j = col - 1;
      while (i > 0 && j > 0 && this.read(i, j) === oppo) {
        this.mutate(i, j, myStone);
        i--;
        j--;
      }
    }
    if (this.canFlipUpRight(row, col, myStone)) {
      let i = row - 1;
      let j = col + 1;
      while (i > 0 && j < this.width && this.read(i, j) === oppo) {
        this.mutate(i, j, myStone);
        i--;
        j++;
      }
    }
    if (this.canFlipDownLeft(row, col, myStone)) {
      let i = row + 1;
      let j = col - 1;
      while (i < this.height && j > 0 && this.read(i, j) === oppo) {
        this.mutate(i, j, myStone);
        i++;
        j--;
      }
    }
    if (this.canFlipDownRight(row, col, myStone)) {
      let i = row + 1;
      let j = col + 1;
      while (i < this.height && j < this.width && this.read(i, j) === oppo) {
        this.mutate(i, j, myStone);
        i++;
        j++;
      }
    }
  }

  getPlaceable(myStone) {
    let ret = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        let txt = this.canFlipStone(i, j, myStone);
        if (txt !== "") {
          ret.push([i, j, txt]);
        }
      }
    }
    return ret;
  }

  clone() {
    let ret = new Board(this.width, this.height);
    for (let i = 0; i < this.height; i++) {
      ret.board[i] = [...this.board[i]];
    }
    return ret;
  }
}

export { flipped, Board };

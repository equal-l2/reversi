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

class Dir {
  static Up = new this(-1, 0);
  static Down = new this(1, 0);
  static Left = new this(0, -1);
  static Right = new this(0, 1);
  static UpLeft = new this(-1, -1);
  static UpRight = new this(-1, 1);
  static DownLeft = new this(1, -1);
  static DownRight = new this(1, 1);
  static Dirs = [
    this.Up,
    this.Down,
    this.Left,
    this.Right,
    this.UpLeft,
    this.UpRight,
    this.DownLeft,
    this.DownRight,
  ];

  constructor(row, col) {
    this.row = row;
    this.col = col;
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
    if (0 <= row && row < this.height && 0 <= col && col < this.width) {
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

  canFlipTo(row, col, myStone, dir) {
    const oppo = flipped(myStone);
    let i = row + dir.row;
    let j = col + dir.col;
    while (true) {
      if (this.read(i, j) !== oppo) break;
      i += dir.row;
      j += dir.col;
      if (this.read(i, j) === myStone) {
        return true;
      }
    }
    return false;
  }

  canFlipStone(row, col, myStone) {
    validateState(myStone);
    if (this.read(row, col) !== 0) {
      return "";
    }

    const dirStrs = ["U", "D", "L", "R", "ul", "ur", "dl", "dr"];

    let ret = "";
    for (let i = 0; i < 8; i++) {
      if (this.canFlipTo(row, col, myStone, Dir.Dirs[i])) {
        ret += dirStrs[i];
      }
    }
    return ret;
  }

  flipTo(row, col, myStone, dir) {
    const oppo = flipped(myStone);
    let i = row + dir.row;
    let j = col + dir.col;
    // the initial i and j is always oppo
    // as it is already checked with canFlipTo
    do {
      this.mutate(i, j, myStone);
      i += dir.row;
      j += dir.col;
    } while (this.read(i, j) === oppo);
  }

  placeStone(row, col, myStone) {
    this.mutate(row, col, myStone);

    for (let dir of Dir.Dirs) {
      if (this.canFlipTo(row, col, myStone, dir)) {
        this.flipTo(row, col, myStone, dir);
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

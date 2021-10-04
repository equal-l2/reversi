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
    if (width > 31) {
      throw new Error("Board width is too large")
    }

    this.width = width;
    this.height = height;
    this.blackBoard = new Array(height).fill(0);
    this.whiteBoard = new Array(height).fill(0);

    /*
    // for checking integrity of implementation
    this.oldBoard = new Array(height)
      .fill(null) // for map (undefined won't work)
      .map(() => {
        return new Array(width).fill(0);
      });
    */
  }

  placeCanonicalStones() {
    const halfH = Math.trunc(this.height / 2);
    const halfW = Math.trunc(this.width / 2);
    this.mutate(halfH - 1, halfW - 1, 1);
    this.mutate(halfH - 1, halfW, 2);
    this.mutate(halfH, halfW - 1, 2);
    this.mutate(halfH, halfW, 1);
  }

  mutate(row, col, value) {
    switch(value) {
      case 0: // empty
        this.blackBoard[row] &= ~(1 << col);
        this.whiteBoard[row] &= ~(1 << col);
        break;
      case 1: // black
        this.blackBoard[row] |= (1 << col);
        this.whiteBoard[row] &= ~(1 << col);
        break;
      case 2: // white
        this.blackBoard[row] &= ~(1 << col);
        this.whiteBoard[row] |= (1 << col);
        break;
    }

    /*
    // checking integrity
    {
      this.oldBoard[row][col] = validateState(value);
      for(let i = 0; i < this.height; i++) {
        for(let j = 0; j < this.width; j++) {
          let val = this.read(row, col);
          if (val !== this.oldBoard[row][col]) {
            throw new Error("Integrity is broken");
          }
        }
      }
    }
    */
  }

  read(row, col) {
    if (0 <= row && row < this.height && 0 <= col && col < this.width) {
      if (this.blackBoard[row] & (1 << col)) {
        return 1;
      }
      else if (this.whiteBoard[row] & (1 << col)) {
        return 2;
      } else {
        return 0;
      }
    } else {
      return null;
    }
  }

  countOnes(num) {
    let cnt = 0;
    let mask = 1;
    for(let i = 0; i < this.width; i++) {
      if (num & mask) cnt++;
      mask <<= 1;
    }
    return cnt;
  }

  count() {
    let counts = [0, 0, 0];
    for (let i = 0; i < this.height; i++) {
      const blackCnt = this.countOnes(this.blackBoard[i]);
      const whiteCnt = this.countOnes(this.whiteBoard[i]);
      const emptyCnt = this.width - (blackCnt + whiteCnt);
      counts[0] += emptyCnt;
      counts[1] += blackCnt;
      counts[2] += whiteCnt;
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
    ret.blackBoard = [...this.blackBoard];
    ret.whiteBoard = [...this.whiteBoard];

    /*
    // for checking integrity
    for (let i = 0; i < this.height; i++) {
      ret.oldBoard[i] = [...this.oldBoard[i]];
    }
    */
 
    return ret;
  }
}

export { flipped, Board };

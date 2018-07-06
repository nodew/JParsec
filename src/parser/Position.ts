class Position {
  line: number;
  column: number;

  constructor(line: number = 1, column: number = 1) {
    this.line = line;
    this.column = column;
  }

  nextColumn(): Position {
    return new Position(this.line, this.column + 1);
  }

  nextLine(): Position {
    return new Position(this.line + 1, 0);
  }

  updatePosByChar(char: string) {
    if (char === "\n") {
      return this.nextLine();
    } else if (char === "\t") {
      return new Position(this.line, this.column + 8 - ((this.column - 1) % 8));
    }
    return this.nextColumn();
  }
}

export default Position;

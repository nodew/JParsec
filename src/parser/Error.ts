import Position from "./Position";

export enum ErrorType {
  NONE,
  MISSING,
  UNEXPECT,
  EXPECT,
  FAILURE
}

export type ErrorMessage = [ErrorType, string];

class ParseError {
  pos: Position;
  errors: ErrorMessage[];

  constructor(pos: Position, errors: ErrorMessage[]) {
    this.pos = pos;
    this.errors = errors;
  }

  append(error: ErrorMessage): ParseError {
    this.errors.push(error);
    return this;
  }

  toString(): string {
    const errMsg = [
      `parse failed at position `,
      `line ${this.pos.line}, column ${this.pos.column}\n`,
      this.errors.map(this.showErrorMsg).join(", ")
    ].join("");
    return errMsg;
  }

  showErrorMsg([errType, msg]: ErrorMessage) {
    switch (errType) {
      case ErrorType.EXPECT:
        return `expect ${msg}`;
      case ErrorType.UNEXPECT:
        return `unexpect ${msg}`;
      case ErrorType.MISSING:
        return `missing ${msg}, `;
      case ErrorType.FAILURE:
        return msg;
      default:
        return "";
    }
  }
}

export default ParseError;

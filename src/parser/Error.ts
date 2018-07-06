import Position from "./Position";

export enum ErrorType {
  NONE,
  MISSING,
  UNEXPECT,
  EXPECT,
  FAILURE
}

export class Error {
  errType: ErrorType;
  message: string;

  constructor(errType: ErrorType, message?: string) {
    this.errType = errType;
    this.message = message || "";
  }
}

class ParseError {
  pos: Position;
  errors: Error[];

  constructor(pos: Position, errors: Error[]) {
    this.pos = pos;
    this.errors = errors;
  }
}

export default ParseError;

import Position from "./Position";
import Stream from "./Stream";

class StateT<T> {
  stream: Stream;
  userState: T;
  pos: Position;

  constructor(stream: Stream, uState?: T, pos?: Position) {
    this.stream = stream;
    this.userState = uState;
    this.pos = pos || new Position();
  }

  static empty() {
    return new StateT<any>(new Stream(""));
  }

  next() {
    return new StateT(
      this.stream.move(1),
      this.userState,
      this.pos.updatePosByChar(this.stream.head())
    );
  }

  getPos() {
    return this.pos;
  }

  getStream() {
    return this.stream;
  }

  getState() {
    return this.userState;
  }

  setState(st) {
    return new StateT(this.stream, st, this.pos);
  }
}

export default StateT;

import Position from "./Position";
import Stream from "./Stream";

class StateT<T> {
  pos: Position;
  stream: Stream;
  userState: T;

  constructor(stream: Stream, uState?: T, pos?: Position) {
    this.stream = stream;
    this.pos = pos || new Position();
    this.userState = uState;
  }

  next() {
    return new StateT(
      this.stream.move(1),
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

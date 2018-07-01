import Stream from "./Stream";

class Result<T> {
  value: T;
  rest: Stream;

  constructor(value: T, rest: Stream) {
    this.value = value;
    this.rest = rest;
  }
}

export class Success<T> extends Result<T> {
  map(fn) {
    return new Success(fn(this.value), this.rest);
  }

  bimap(s, _) {
    return new Success(s(this.value), this.rest);
  }

  chain(fn) {
    return fn(this.value, this.rest);
  }

  fold(s, _) {
    return s(this.value, this.rest);
  }
}

export class Failure<T> extends Result<T> {
  map(fn) {
    return this;
  }

  bimap(_, f) {
    return new Failure(f(this.value), this.rest);
  }

  chain(_) {
    return this;
  }

  fold(_, f) {
    return f(this.value, this.rest);
  }
}

export default Result;

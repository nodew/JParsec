import Stream from "./Stream";

export type ParseResult<S, F> = Success<S> | Failure<F>;

abstract class Result<T> {
  value: T;
  rest: Stream;

  constructor(value: T, rest: Stream) {
    this.value = value;
    this.rest = rest;
  }

  abstract map<S>(fn: (v: T) => S): ParseResult<S, T>;

  abstract bimap<S, F>(s: (v: T) => S, f: (v: T) => F): ParseResult<S, F>;

  abstract chain<S2, _>(
    fn: (v: T, rest?: Stream) => ParseResult<S2, T>
  ): ParseResult<S2, T>;

  abstract fold<S2, F2>(
    s: (v: T, rest?: Stream) => ParseResult<S2, F2>,
    f: (v: T, rest?: Stream) => ParseResult<S2, F2>
  ): ParseResult<S2, F2>;
}

export class Success<T> extends Result<T> {
  map<S>(fn: (v: T) => S): Success<S> {
    return new Success(fn(this.value), this.rest);
  }

  bimap<S, _>(s: (v: T) => S, _): Success<S> {
    return new Success(s(this.value), this.rest);
  }

  chain<S2, F2>(
    fn: (v: T, rest?: Stream) => ParseResult<S2, F2>
  ): ParseResult<S2, F2> {
    return fn(this.value, this.rest);
  }

  fold<S2, F2>(s: (v: T, rest?: Stream) => ParseResult<S2, F2>, _) {
    return s(this.value, this.rest);
  }
}

export class Failure<T> extends Result<T> {
  map(_: any): Failure<T> {
    return this;
  }

  bimap<_, F>(_, f: (v: T) => F): Failure<F> {
    return new Failure(f(this.value), this.rest);
  }

  chain(_: any): Failure<T> {
    return this;
  }

  fold<S2, F2>(_, f: (v: T, rest?: Stream) => ParseResult<S2, F2>) {
    return f(this.value, this.rest);
  }
}

export default Result;

import ParseError from "./Error";
import StateT from "./State";

class ParseResultT<T, U> {
  value: T | ParseError;
  state: StateT<U>;

  constructor(value: T | ParseError, state: StateT<U>) {
    this.value = value;
    this.state = state;
  }

  get isSuccess(): boolean {
    return !this.isFailure;
  }

  get isFailure(): boolean {
    return this.value instanceof ParseError;
  }

  map<G>(fn: (v: T) => G): ParseResultT<G, U> {
    if (this.value instanceof ParseError) {
      return new ParseResultT<G, U>(this.value, this.state);
    } else {
      return new ParseResultT<G, U>(fn(this.value), this.state);
    }
  }

  bimap<G>(
    s: (v: T) => G,
    f: (v: ParseError) => ParseError
  ): ParseResultT<G, U> {
    if (this.value instanceof ParseError) {
      return new ParseResultT<G, U>(f(this.value), this.state);
    } else {
      return new ParseResultT<G, U>(s(this.value), this.state);
    }
  }

  chain<G>(
    fn: (v: T, state: StateT<U>) => ParseResultT<G, U>
  ): ParseResultT<G, U> {
    if (this.value instanceof ParseError) {
      return new ParseResultT<G, U>(this.value, this.state);
    } else {
      return fn(this.value, this.state);
    }
  }

  fold<G>(
    s: (v: T, state?: StateT<U>) => ParseResultT<G, U>,
    f: (v: ParseError, state?: StateT<U>) => ParseResultT<G, U>
  ): ParseResultT<G, U> {
    if (this.value instanceof ParseError) {
      return f(this.value, this.state);
    } else {
      return s(this.value, this.state);
    }
  }
}

export default ParseResultT;

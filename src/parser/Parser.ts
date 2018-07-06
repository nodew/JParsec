import StateT from "./State";
import ParseError from "./Error";
import ParseResultT from "./Result";

export type ParseT<T, U> = (state: StateT<U>) => ParseResultT<T, U>;

class ParserT<T, U> {
  parse: ParseT<T, U>;

  constructor(parse: ParseT<T, U>) {
    this.parse = parse;
  }

  run(state: StateT<U>): ParseResultT<T, U> {
    return this.parse(state);
  }

  map<G>(f: (x: T) => G): ParserT<G, U> {
    return new ParserT((state: StateT<U>) => {
      return this.parse(state).map<G>(f);
    });
  }

  bimap<G>(
    s: ((value: T) => G),
    f: ((err: ParseError) => ParseError)
  ): ParserT<G, U> {
    return new ParserT<G, U>((state: StateT<U>) => {
      return this.parse(state).bimap(s, f);
    });
  }

  chain<G>(f: (value: T, state?: StateT<U>) => ParserT<G, U>): ParserT<G, U> {
    return new ParserT<G, U>((state: StateT<U>) => {
      return this.parse(state).chain<G>((v, s) => f(v, s).run(s));
    });
  }

  fold<G>(
    s: ((value: T) => ParseResultT<G, U>),
    f: ((err: ParseError) => ParseResultT<G, U>)
  ): ParserT<G, U> {
    return new ParserT<G, U>((state: StateT<U>) => {
      return this.parse(state).fold<G>(s, f);
    });
  }
}

export type Parse<R> = ParseT<R, any>;

export type Parser<R> = ParserT<R, any>;

export default ParserT;

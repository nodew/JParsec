import Stream from "./Stream";
import { Success, ParseResult } from "./Result";

export type ParseF<S, F> = (stream: Stream) => ParseResult<S, F>;

class Parser<S, F> {
  parse: ParseF<S, F>;

  constructor(parse: ParseF<S, F>) {
    this.parse = parse;
  }

  run(iterable: Stream | string | Array<string>): ParseResult<S, F> {
    if (iterable instanceof Stream) {
      return this.parse(iterable);
    } else {
      return this.parse(new Stream(iterable));
    }
  }

  map<T>(f: (x: S) => T): Parser<T, F> {
    return new Parser(stream => {
      const result = this.parse(stream);
      if (result instanceof Success) {
        return result.map<T>(f);
      } else {
        return result.map(f);
      }
    });
  }

  bimap<S2, F2>(s: ((x: S) => S2), f: ((y: F) => F2)): Parser<S2, F2> {
    return new Parser<S2, F2>(stream => {
      const result = this.parse(stream);
      if (result instanceof Success) {
        return result.bimap<S2, F>(s, f);
      } else {
        return result.bimap<S, F2>(s, f);
      }
    });
  }

  chain<S2>(f: (v: S, rest?: Stream) => Parser<S2, F>): Parser<S | S2, F> {
    return new Parser(stream => {
      const result = this.parse(stream);
      if (result instanceof Success) {
        return result.chain((v, s) => f(v, result.rest).run(s));
      } else {
        return result.chain(f);
      }
    });
  }

  fold<S2, F2>(
    s: (v: S) => ParseResult<S2, F>,
    f: (v: F) => ParseResult<S, F2>
  ): Parser<S | S2, F | F2> {
    return new Parser<S | S2, F | F2>(stream => {
      const result = this.parse(stream);
      if (result instanceof Success) {
        return result.fold<S2, F>(s, f);
      } else {
        return result.fold<S, F2>(s, f);
      }
    });
  }
}

export default Parser;

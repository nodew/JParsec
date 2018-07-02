import Parser from "./parser/Parser";
import { Success, Failure } from "./parser/Result";
import Stream from "./parser/Stream";

export const either = (parsers: Parser<any, any>[]): Parser<any, any> =>
  new Parser((stream: Stream) => {
    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i];
      const result = parser.run(stream);
      if (result instanceof Success) {
        return result;
      }
    }
    return new Failure("either failed", stream);
  });

export function always<S>(value: S): Parser<S, null> {
  return new Parser<S, null>((stream: Stream) => new Success(value, stream));
}

export function never<F>(value: F): Parser<null, F> {
  return new Parser<null, F>((stream: Stream) => new Failure(value, stream));
}

export function append<S1, S2>(
  p1: Parser<[S1], any>,
  p2: Parser<S2, any>
): Parser<Array<S1 | S2>, any> {
  return p1.chain((vs: Array<S1 | S2>) => p2.map((v: S2) => vs.concat([v])));
}

export function concat<S1, S2>(
  p1: Parser<S1[], any>,
  p2: Parser<S2, any>
): Parser<(S1 | S2)[], any> {
  return p1.chain((xs: Array<S1 | S2>) => p2.map(ys => xs.concat(ys)));
}

export function sequence(
  parsers: Parser<string | any, any>[]
): Parser<string | any[], any> {
  return parsers.reduce((acc, parser) => append(acc, parser), always([]));
}

export function between(l, p, r) {
  return sequence([l, p, r]).map(v => v[1]);
}

export function maybe<S>(parser: Parser<S, any>): Parser<S, null> {
  return new Parser<S, null>((stream: Stream) => {
    const result = parser.run(stream);
    if (result instanceof Success) {
      return result.fold<S, null>(
        (v, s) => new Success<S>(v, s),
        (v, s) => new Success<S>(null, stream)
      );
    } else {
      return result.fold<S, null>(
        (v, s) => new Success<S>(v, s),
        (v, s) => new Success<S>(null, stream)
      );
    }
  });
}

export function lookAhead<S, F>(parser: Parser<S, F>): Parser<S, F> {
  return new Parser((stream: Stream) => {
    const result = parser.run(stream);
    if (result instanceof Success) {
      return result.fold<S, F>(
        v => new Success<S>(v, stream),
        v => new Failure<F>(v, stream)
      );
    } else {
      return result.fold<S, F>(
        v => new Success<S>(v, stream),
        v => new Failure<F>(v, stream)
      );
    }
  });
}

export function many<S, F>(parser: Parser<S, F>): Parser<S[], F> {
  return new Parser<S[], F>((stream: Stream) => {
    const result = parser.run(stream);
    if (result instanceof Success) {
      return result.fold<S[], F>(
        (value, s) =>
          many<S, F>(parser)
            .map(rest => [value].concat(rest))
            .run(s),
        (value, s) => new Success<S[]>([], stream)
      );
    } else {
      return result.fold<S[], F>(
        (value, s) =>
          many(parser)
            .map(rest => [value].concat(rest))
            .run(s),
        (_, s) => new Success<S[]>([], stream)
      );
    }
  });
}

export function many1<S, F>(parser: Parser<S, F>): Parser<S[], F | string> {
  return new Parser<S[], F | string>((stream: Stream) => {
    const result = parser.run(stream);
    if (result instanceof Success) {
      return result.fold<S[], F>(
        (value, s) =>
          many(parser)
            .map(rest => [value].concat(rest))
            .run(s),
        (value, s) => new Failure<F>(value, stream)
      );
    } else {
      return new Failure<string>("unexpected", stream);
    }
  });
}

export function manyTill<S, F>(
  parser: Parser<S, F>,
  end: Parser<any, any>
): Parser<S[], F> {
  return new Parser<S[], F>((stream: Stream) => {
    let _stream = stream;
    let values = [];
    while (end.run(_stream) instanceof Failure) {
      const result = parser.run(_stream);
      _stream = result.rest;
      if (result instanceof Failure) {
        return new Failure<F>(result.value, stream);
      } else {
        values.push(result.value);
      }
    }
    return new Success<S[]>(values, _stream);
  });
}

export function count<S, F>(n: number, parser: Parser<S, F>): Parser<S[], F> {
  return new Parser<S[], F>((stream: Stream) => {
    if (n <= 0) {
      return new Success<S[]>([], stream);
    }
    let _stream = stream;
    let values = [];
    let i = 0;
    let result;
    while (i < n) {
      result = parser.run(_stream);
      _stream = result.rest;
      if (result instanceof Success) {
        i++;
        values.push(result.value);
      } else {
        return new Failure<F>(result.value, stream);
      }
    }
    return new Success<Array<S>>(values, _stream);
  });
}

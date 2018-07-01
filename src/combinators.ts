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

export const always = (value: any): Parser<any, any> =>
  new Parser((stream: Stream) => new Success(value, stream));

export const never = (value: any): Parser<any, any> =>
  new Parser((stream: Stream) => new Failure(value, stream));

export const append = (
  p1: Parser<any, any>,
  p2: Parser<any, any>
): Parser<any, any> => p1.chain(vs => p2.map(v => vs.concat([v])));

export const concat = (
  p1: Parser<any, any>,
  p2: Parser<any, any>
): Parser<any, any> => p1.chain(xs => p2.map(ys => xs.concat(ys)));

export const sequence = (parsers: Parser<any, any>[]): Parser<any, any> =>
  parsers.reduce((acc, parser) => append(acc, parser), always([]));

export const between = (l, p, r) => sequence([l, p, r]).map(v => v[1]);

export const maybe = (parser: Parser<any, any>): Parser<any, any> =>
  new Parser((stream: Stream) =>
    parser
      .run(stream)
      .fold((v, s) => new Success(v, s), (v, s) => new Success(null, stream))
  );

export const lookAhead = (parser: Parser<any, any>): Parser<any, any> =>
  new Parser((stream: Stream) =>
    parser
      .run(stream)
      .fold(v => new Success(v, stream), v => new Failure(v, stream))
  );

export const many = (parser: Parser<any, any>): Parser<any, any> =>
  new Parser((stream: Stream) =>
    parser.run(stream).fold(
      (value, s) =>
        many(parser)
          .map(rest => [value].concat(rest))
          .run(s),
      (value, s) => new Success([], stream)
    )
  );

export const manyTill = (
  parser: Parser<any, any>,
  end: Parser<any, any>
): Parser<any[], any> =>
  new Parser((stream: Stream) => {
    let _stream = stream;
    let values = [];
    while (end.run(_stream) instanceof Failure) {
      const result = parser.run(_stream);
      _stream = result.rest;
      if (result instanceof Failure) {
        return new Failure(result.value, stream);
      } else {
        values.push(result.value);
      }
    }
    return new Success(values, _stream);
  });

export const count = (n: number, parser: Parser<any, any>): Parser<any, any> =>
  new Parser((stream: Stream) => {
    if (n <= 0) {
      return new Success([], stream);
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
        return new Failure(result.value, stream);
      }
    }
    return new Success<Array<any>>(values, _stream);
  });

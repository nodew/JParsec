import Parser from "./parser/Parser";
import { Success, Failure } from "./parser/Result";
import Stream from "./parser/Stream";

export const either = (parsers: Parser<any>[]): Parser<any> =>
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

export const always = (value): Parser<any> =>
  new Parser((stream: Stream) => new Success(value, stream));

export const never = (value): Parser<any> =>
  new Parser((stream: Stream) => new Failure(value, stream));

export const append = (p1: Parser<any>, p2: Parser<any>): Parser<any> =>
  p1.chain(vs => p2.map(v => vs.concat([v])));

export const concat = (p1: Parser<any>, p2: Parser<any>): Parser<any> =>
  p1.chain(xs => p2.map(ys => xs.concat(ys)));

export const sequence = (parsers: Parser<any>[]): Parser<any> =>
  parsers.reduce((acc, parser) => append(acc, parser), always([]));

export const between = (l, p, r) => sequence([l, p, r]).map(v => v[1]);

export const maybe = (parser: Parser<any>): Parser<any> =>
  new Parser((stream: Stream) =>
    parser
      .run(stream)
      .fold((v, s) => new Success(v, s), (v, s) => new Success(null, stream))
  );

export const lookahead = (parser: Parser<any>): Parser<any> =>
  new Parser((stream: Stream) =>
    parser
      .run(stream)
      .fold(v => new Success(v, stream), v => new Failure(v, stream))
  );

export const many = (parser: Parser<any>): Parser<any> =>
  new Parser((stream: Stream) =>
    parser.run(stream).fold(
      (value, s) =>
        many(parser)
          .map(rest => [value].concat(rest))
          .run(s),
      (value, s) => new Success([], stream)
    )
  );

export const not = (parser: Parser<any>): Parser<any> =>
  new Parser((stream: Stream) =>
    parser
      .run(stream)
      .fold(
        (value, s) => new Failure("not failed", stream),
        (value, s) =>
          stream.length > 0
            ? new Success(stream.head(), stream.move(1))
            : new Failure("unexpected end", stream)
      )
  );

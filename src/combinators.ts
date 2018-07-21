import ParserT from "./parser/Parser";
import StateT from "./parser/State";
import ParseError, { ErrorType, ErrorMessage } from "./parser/Error";
import ParseResultT from "./parser/Result";

export const either = (
  parsers: ParserT<any, any>[],
  expect?: string
): ParserT<any, any> =>
  new ParserT((state: StateT<any>) => {
    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i];
      const result = parser.run(state);
      if (result.isSuccess) {
        return result;
      }
    }
    return new ParseResultT(
      new ParseError(state.getPos(), [
        [ErrorType.EXPECT, expect],
        [ErrorType.UNEXPECT, state.stream.head()]
      ]),
      state
    );
  });

export function always<T>(value: T): ParserT<T, any> {
  return new ParserT<T, any>(
    (state: StateT<any>) => new ParseResultT(value, state)
  );
}

export function never(errorMsg: ErrorMessage): ParserT<any, any> {
  return new ParserT<null, any>(
    (state: StateT<any>) =>
      new ParseResultT<any, any>(
        new ParseError(state.getPos(), [errorMsg]),
        state
      )
  );
}

export function append(
  p1: ParserT<any[], any>,
  p2: ParserT<any, any>
): ParserT<any[], any> {
  return p1.chain((vs: any[]) => p2.map<any>((v: any) => vs.concat([v])));
}

export function concat(
  p1: ParserT<any[], any>,
  p2: ParserT<any, any>
): ParserT<any[], any> {
  return p1.chain((xs: any) => p2.map(ys => xs.concat(ys)));
}

export function sequence(parsers: ParserT<any, any>[]): ParserT<any[], any> {
  return parsers.reduce((acc, parser) => append(acc, parser), always([]));
}

export function between(l, p, r) {
  return sequence([l, p, r]).map(v => v[1]);
}

export function maybe<T>(parser: ParserT<T, any>): ParserT<T, any> {
  return new ParserT<T, any>((state: StateT<any>) =>
    parser
      .run(state)
      .fold<T>(
        (v, s) => new ParseResultT<T, any>(v, s),
        (v, s) => new ParseResultT<T, any>(null, state)
      )
  );
}

export function lookAhead<T>(parser: ParserT<T, any>): ParserT<T, any> {
  return new ParserT((state: StateT<any>) =>
    parser
      .run(state)
      .fold<T>(
        v => new ParseResultT<T, any>(v, state),
        v => new ParseResultT<T, any>(v, state)
      )
  );
}

export function many<T>(parser: ParserT<T, any>): ParserT<T[], any> {
  return new ParserT<T[], any>((state: StateT<any>) =>
    parser.run(state).fold<T[]>(
      (v, s) =>
        many<T>(parser)
          .map(next => [v].concat(next))
          .run(s),
      (v, s) => new ParseResultT<T[], any>([], state)
    )
  );
}

export function many1<T>(parser: ParserT<T, any>): ParserT<T[], any> {
  return new ParserT<T[], any>((state: StateT<any>) => {
    const result = parser.run(state);
    if (result.value instanceof ParseError) {
      return new ParseResultT<T[], any>(result.value, result.nextState);
    } else {
      return result.fold<T[]>(
        (v, s) =>
          many(parser)
            .map(next => [v].concat(next))
            .run(s),
        (v, s) => new ParseResultT<T[], any>(v, s)
      );
    }
  });
}

export function manyTill<T, G>(
  parser: ParserT<T, any>,
  end: ParserT<G, any>
): ParserT<T[], any> {
  return new ParserT<T[], any>((state: StateT<any>) => {
    let st = state;
    let values = [];
    while (end.run(st).isFailure) {
      const result = parser.run(st);
      st = result.nextState;
      if (result.value instanceof ParseError) {
        return new ParseResultT<T[], any>(result.value, st);
      } else {
        values.push(result.value);
      }
    }
    return new ParseResultT<T[], any>(values, st);
  });
}

export function count<T>(
  n: number,
  parser: ParserT<T, any>
): ParserT<T[], any> {
  return new ParserT<T[], any>((state: StateT<any>) => {
    if (n <= 0) {
      return new ParseResultT<T[], any>([], state);
    }
    let st = state;
    let values = [];
    let i = 0;
    let result;
    while (i < n) {
      result = parser.run(st);
      st = result.nextState;
      if (result.value instanceof ParseError) {
        return new ParseResultT<T[], any>(result.value, state);
      } else {
        i++;
        values.push(result.value);
      }
    }
    return new ParseResultT<T[], any>(values, st);
  });
}

export const not = (parser: ParserT<any, any>) =>
  new ParserT<string, any>((state: StateT<any>) =>
    parser
      .run(state)
      .fold<any>(
        (v, s) =>
          new ParseResultT<string, any>(
            new ParseError(state.getPos(), [[ErrorType.FAILURE, "not"]]),
            state
          ),
        (v, s) => new ParseResultT<string, any>(v, state)
      )
  );

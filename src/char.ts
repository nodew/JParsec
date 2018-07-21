import ParserT from "./parser/Parser";
import { many, sequence } from "./combinators";
import StateT from "./parser/State";
import ParseResultT from "./parser/Result";
import ParseError, { ErrorType } from "./parser/Error";

export const satisfied = (
  predicate: ((x: string) => boolean),
  expect?: string
): ParserT<string, any> =>
  new ParserT((state: StateT<any>) => {
    if (state.stream.length === 0) {
      return new ParseResultT<string, any>(
        new ParseError(state.getPos(), [
          [ErrorType.UNEXPECT, "unexpected end"]
        ]),
        state
      );
    }
    const value = state.stream.head();
    if (predicate(value)) {
      return new ParseResultT<string, any>(value, state.next());
    }
    return new ParseResultT<string, any>(
      new ParseError(state.getPos(), [
        [ErrorType.UNEXPECT, value],
        [ErrorType.EXPECT, expect]
      ]),
      state
    );
  });

export const char = (c: string) => satisfied(x => x === c, c);

export const anyChar = satisfied(x => true, "any char");

export const oneOf = (chars: string | Array<string>) =>
  satisfied(x => chars.indexOf(x) >= 0, "one of " + chars);

export const noneOf = (chars: string | Array<string>) =>
  satisfied(x => chars.indexOf(x) === -1, "none of " + chars);

export const letter = satisfied(x => /[a-zA-Z]/.test(x), "a letter");

export const lower = satisfied(x => /[a-z]/.test(x), "lowercase char");

export const upper = satisfied(x => /[A-Z]/.test(x), "uppercase char");

export const digit = satisfied(x => /[0-9]/.test(x), "a digit char");

export const alphaNum = satisfied(
  x => /[0-9a-zA-Z]/.test(x),
  "an alpha number"
);

export const newline = char("\n");

export const space = char(" ");

export const tab = char("\t");

export const spaces = many(space);

export const whiteSpaces = many(oneOf(" \n\t\r"));

export const string = (str: string) =>
  sequence(str.split("").map(char)).bimap<string>(
    _ => str,
    parseError => parseError.append([ErrorType.EXPECT, str])
  );

export const crlf = string("\r\n");

export const eof = new ParserT((state: StateT<any>) => {
  if (state.stream.length === 0) {
    return new ParseResultT<null, any>(null, state);
  }

  return new ParseResultT<string, any>(
    new ParseError(state.getPos(), [[ErrorType.EXPECT, "EOF"]]),
    state
  );
});

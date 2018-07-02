import Parser from "./parser/Parser";
import { Failure, Success } from "./parser/Result";
import Stream from "./parser/Stream";
import { many, sequence } from "./combinators";

export const satisfied = (
  predicate: ((x: string) => boolean)
): Parser<string, string> =>
  new Parser((stream: Stream) => {
    console.log(stream);
    if (stream.length === 0) {
      return new Failure<string>("unexpected end", stream);
    }
    const value = stream.head();
    if (predicate(value)) {
      return new Success<string>(value, stream.move(1));
    }
    return new Failure<string>("predicate did not match", stream);
  });

export const char = (c: string): Parser<string, string> =>
  satisfied(x => x === c);

export const anyChar = satisfied(x => true);

export const oneOf = (chars: string | Array<string>): Parser<string, string> =>
  satisfied(x => chars.indexOf(x) >= 0);

export const noneOf = (chars: string | Array<string>): Parser<string, string> =>
  satisfied(x => chars.indexOf(x) === -1);

export const letter: Parser<string, string> = satisfied(x =>
  /[a-zA-Z]/.test(x)
);

export const lower: Parser<string, string> = satisfied(x => /[a-z]/.test(x));

export const upper: Parser<string, string> = satisfied(x => /[A-Z]/.test(x));

export const digit: Parser<string, string> = satisfied(x => /[0-9]/.test(x));

export const alphaNum: Parser<string, string> = satisfied(x =>
  /[0-9a-zA-Z]/.test(x)
);

export const newline: Parser<string, string> = char("\n");

export const space: Parser<string, string> = char(" ");

export const tab: Parser<string, string> = char("\t");

export const spaces: Parser<string[], string> = many(space);

export const whiteSpaces = many(oneOf(" \n\t\r"));

export const string = (str: string): Parser<string, string> =>
  sequence(str.split("").map(char)).bimap<string, string>(
    _ => str,
    fail => fail
  );

export const not = (parser: Parser<string, string>): Parser<string, string> =>
  new Parser<string, string>((stream: Stream) => {
    const result = parser.run(stream);
    if (result instanceof Success) {
      return result.fold<string, string>(
        (value, s) => new Failure("not failed", stream),
        (value, s) =>
          stream.length > 0
            ? new Success(stream.head(), stream.move(1))
            : new Failure("unexpected end", stream)
      );
    } else {
      return result.fold<string, string>(
        (value, s) => new Failure("not failed", stream),
        (value, s) =>
          stream.length > 0
            ? new Success(stream.head(), stream.move(1))
            : new Failure("unexpected end", stream)
      );
    }
  });

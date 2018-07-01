import Parser from "./parser/Parser";
import { Failure, Success } from "./parser/Result";
import Stream from "./parser/Stream";
import { many, sequence } from "./combinators";

export const satisfied = (
  predicate: ((x: string) => boolean)
): Parser<string> =>
  new Parser((stream: Stream) => {
    if (stream.length === 0) {
      return new Failure<string>("unexpected end", stream);
    }
    const value = stream.head();
    if (predicate(value)) {
      return new Success<string>(value, stream.move(1));
    }
    return new Failure<string>("predicate did not match", stream);
  });

export const char = (c: string): Parser<string> => satisfied(x => x === c);

export const anyChar = satisfied(x => true);

export const oneOf = (chars: string | Array<string>): Parser<string> =>
  satisfied(x => chars.indexOf(x) >= 0);

export const noneOf = (chars: string | Array<string>): Parser<string> =>
  satisfied(x => chars.indexOf(x) === -1);

export const letter = satisfied(x => /[a-zA-Z]/.test(x));

export const lower = satisfied(x => /[a-z]/.test(x));

export const upper = satisfied(x => /[A-Z]/.test(x));

export const digit = satisfied(x => /[0-9]/.test(x));

export const alphaNum = satisfied(x => /[0-9a-zA-Z]/.test(x));

export const newline = char("\n");

export const space = char(" ");

export const spaces = many(space);

export const string = (str: string) => sequence(str.split("").map(char));

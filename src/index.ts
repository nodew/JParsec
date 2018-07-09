import Parser from "./parser/Parser";
import Stream from "./parser/Stream";
import ParserT from "./parser/Parser";
import ParseError from "./parser/Error";
import StateT from "./parser/State";
import ParseResultT from "./parser/Result";

export * from "./parser/Result";
export * from "./parser/Error";
export * from "./char";
export * from "./combinators";

export { ParserT, Stream, ParseError, StateT, ParseResultT };

export function parse<T, U>(
  parser: ParserT<T, any>,
  _stream: string,
  uState?: U
): T {
  const stream = new Stream(_stream);
  const initState = new StateT(stream, uState);
  const result = parser.run(initState);
  if (result.value instanceof ParseError) {
    const pos = result.value.pos;
    const errorDetail = [
      `parse failed at position: line ${pos.line}, column ${pos.column}`,
      `error: ${result.value.errors}`
    ].join("\n");
    throw new Error(errorDetail);
  } else {
    return result.value;
  }
}

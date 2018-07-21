import * as P from "../src/char";
import ParseError, { ErrorType } from "../src/parser/Error";
import StateT from "../src/parser/State";
import Stream from "../src/parser/Stream";

class State extends StateT<null> {}

describe("char parser", () => {
  it("char", () => {
    const result = P.char("a").run(new State(new Stream("abc")));
    expect(result.nextState.stream.cursor).toBe(1);
    expect(result.nextState.pos.column).toBe(2);
    expect(result.value).toBe("a");
  });

  it("char unexpect", () => {
    const result = P.char("b").run(new State(new Stream("abc")));
    expect(result.nextState.stream.cursor).toBe(0);
    expect(result.nextState.pos.column).toBe(1);
    expect(result.isFailure).toBe(true);
  });

  it("anyChar", () => {
    const result = P.anyChar.run(new State(new Stream("abc")));
    expect(result.nextState.stream.cursor).toBe(1);
    expect(result.nextState.pos.column).toBe(2);
    expect(result.value).toBe("a");
  });

  it("any char should fail at the end of stream", () => {
    const result = P.anyChar.run(State.empty());
    expect(result.isFailure).toBe(true);
  });

  it("oneOf", () => {
    const result = P.oneOf("abc").run(new State(new Stream("bbb")));
    expect(result.value).toBe("b");
  });

  it("noneOf", () => {
    const result = P.noneOf("abc").run(new State(new Stream("bbb")));
    expect(result.isFailure).toBe(true);
    expect(result.nextState.stream.cursor).toBe(0);
    expect(result.nextState.pos.column).toBe(1);
  });

  it("string", () => {
    const result = P.string("ab").run(new State(new Stream("abc")));
    expect(result.nextState.stream.cursor).toBe(2);
    expect(result.nextState.pos.column).toBe(3);
    expect(result.value).toBe("ab");
  });
});

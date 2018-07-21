import * as P from "../src/combinators";
import ParseError, { ErrorType } from "../src/parser/Error";
import StateT from "../src/parser/State";
import Stream from "../src/parser/Stream";

describe("cominators", () => {
  it("always", async () => {
    const result = P.always("always").run(StateT.empty());
    expect(result.value).toBe("always");
  });

  it("nerver", async () => {
    const result = P.never([ErrorType.FAILURE, ""]).run(StateT.empty());
    expect(result.isFailure).toBe(true);
  });
});

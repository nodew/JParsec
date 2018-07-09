import * as P from "../src/combinators";

test("parser always", async () => {
  const result = P.always("always").run(null);
  expect(result.value).toBe("always");
});

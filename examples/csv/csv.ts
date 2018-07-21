import * as P from "../../src/index";
import * as fs from "fs";
import * as path from "path";

const pLineEnd = P.either([P.crlf, P.newline, P.eof]);

const pColumn = P.sequence([
  P.manyTill<string, string>(P.anyChar, P.either([P.char(","), pLineEnd])).map(
    xs => xs.join("")
  ),
  P.maybe(P.char(","))
]).map(([x, _]) => x);

const pRow = P.sequence([P.manyTill(pColumn, pLineEnd), pLineEnd]).map(
  ([x, _]) => x
);

const pCSV = P.manyTill(pRow, P.eof);

const csvFile = fs.readFileSync(path.resolve(__dirname, "./demo.csv"), "utf8");

const result = P.parse<string[][], null>(pCSV, csvFile);

console.log(result);

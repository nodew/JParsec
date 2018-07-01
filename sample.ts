interface IParseResult {
  success: Boolean;
  value: any;
  rest: string;
}

type Parser = (input: string) => IParseResult;

const char = c => (input): IParseResult => {
  if (input[0] === c) {
    return {
      success: true,
      value: c,
      rest: input.slice(1)
    };
  }
  return {
    success: false,
    value: undefined,
    rest: input
  };
};

const space = char(" ");

const newline = char("\n");

const anyChar = (input): IParseResult => {
  return {
    success: true,
    value: input[0],
    rest: input.slice(1)
  };
};

const letter = (input): IParseResult => {
  if (/[a-zA-z]/.test(input[0])) {
    return {
      success: true,
      value: input[0],
      rest: input.slice(1)
    };
  }
  return {
    success: false,
    value: undefined,
    rest: input
  };
};

const sequence = parsers => (input): IParseResult => {
  let next = input;
  let results = [];
  for (var i = 0; i < parsers.length; i++) {
    const parser = parsers[i];
    const { success, value, rest } = parser(next);
    if (!success) {
      return {
        success,
        value: [],
        rest: input
      };
    }
    results.push(value);
    next = rest;
  }
  return {
    success: true,
    value: results,
    rest: next
  };
};

const either = parsers => (input): IParseResult => {
  for (var i = 0; i < parsers.length; i++) {
    const parser = parsers[i];
    const { success, value, rest } = parser(input);
    if (success) {
      return {
        success,
        value,
        rest
      };
    }
  }
  return {
    success: false,
    value: undefined,
    rest: input
  };
};

const many = parser => (input): IParseResult => {
  let flag = true;
  let next = input;
  let results = [];
  while (flag && next) {
    const { success, value, rest } = parser(next);
    if (!success) {
      flag = false;
    } else {
      results.push(value);
      next = rest;
    }
  }
  return {
    success: true,
    value: results,
    rest: next
  };
};

const string = str => (input): IParseResult => {
  const { success, rest } = sequence(str.split("").map(char))(input);
  return {
    success,
    value: success ? str : "",
    rest
  };
};

const word = (input): IParseResult => {
  const { success, value, rest } = many(letter)(input);
  return {
    success,
    value: value.join(""),
    rest
  };
};

const spaces = many(space);

console.log(either([string("abc"), string("bcd")])("bcdefg"));
console.log(sequence([word, spaces, word])("hello   world"));

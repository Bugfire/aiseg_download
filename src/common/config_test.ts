/**
 * @license config_test.ts
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import { LoadConfig, ConfigType } from "./config";

/* eslint-disable @typescript-eslint/camelcase */

interface Test1 {
  aaa: {
    str: string;
    num: number;
  };
  bbb: string;
}

const Test1Type: ConfigType = {
  aaa: {
    str: "",
    num: 0
  },
  bbb: ""
};

const Test1Json = `
{
  "aaa": {
    "str": "str1",
    "num": 5
  },
  "bbb": "foobar"
}
`;

console.log(Test1Json);
const TEST1 = LoadConfig<Test1>(Test1Json, Test1Type);
console.log(TEST1);

//

interface Test2 {
  aaa: {
    str: string;
    num: number;
  }[];
  bbb: string[];
}

const Test2Type: ConfigType = {
  aaa: [
    {
      str: "",
      num: 0
    }
  ],
  bbb: [""]
};

const Test2Json = `
{
  "aaa": [{
    "str": "str1",
    "num": 5
  }],
  "bbb": ["foobar", "baz"]
}
`;

console.log(Test2Json);
const TEST2 = LoadConfig<Test1>(Test2Json, Test2Type);
console.log(TEST2);

export interface Test {
  inputs: any[];
  output: any;
}

export interface Proto {
  name: string;
  args: string[];
}

export interface Problem {
  markdown: string;
  proto: Proto;
  tests: Test[];
}

export const problems: Array<Problem> = [
  {
    markdown: `# add
literally just add 2 numbers`,
    proto: {
      name: "add",
      args: ["a", "b"],
    },
    tests: [
      { inputs: [1, 2], output: 3 },
      { inputs: [1, -2], output: -1 },
    ],
  },
];

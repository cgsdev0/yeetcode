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
    markdown: `# Integer Palindrome

Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.

- For example, \`121\` is a palindrome, while \`123\` is not.

## Example 1
**Input:** x = 121

**Output:** true

## Example 2
**Input:** x = -121

**Output:** false

**Explanation:** From left to right, it reads \`-121\`. From right to left, it becomes \`121-\`. Therefore, it is not a palindrome.

## Example 3
**Input:** x = 10

**Output:** false

**Explanation:** Reads \`10\` from left to right and \`01\` from right to left.
`,
    proto: {
      name: "isPalindrome",
      args: ["x"],
    },
    tests: [
      { inputs: [121], output: true },
      { inputs: [-121], output: false },
      { inputs: [0], output: true },
      { inputs: [2221], output: false },
      { inputs: [12], output: false },
      { inputs: [124421], output: true },
    ],
  },
  {
    markdown: `# Bracket Pairs
Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

  - Open brackets must be closed by the same type of brackets.
  - Open brackets must be closed in the correct order.
  - Every close bracket has a corresponding open bracket of the same type.
`,
    proto: {
      name: "isValid",
      args: ["s"],
    },
    tests: [
      { inputs: ["()"], output: true },
      { inputs: ["{}"], output: true },
      { inputs: ["[]"], output: true },
      { inputs: ["(){}[]"], output: true },
      { inputs: ["(]"], output: false },
      { inputs: ["()()]"], output: false },
      { inputs: ["]["], output: false },
      { inputs: ["{][}"], output: false },
      { inputs: ["(()[]{}{})"], output: true },
      { inputs: ["{{}}()(()())"], output: true },
    ],
  },
  {
    markdown: `# Stonks
You are given an array prices where prices[i] is the price of a given stock on the \`ith\` day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

## Example 1:

Input: prices = [7,1,5,3,6,4]

Output: 5

Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.

## Example 2:

Input: prices = [7,6,4,3,1]

Output: 0

Explanation: In this case, no transactions are done and the max profit = 0.
`,
    proto: {
      name: "maxProfit",
      args: ["prices"],
    },
    tests: [
      { inputs: [7, 1, 5, 3, 6, 4], output: 5 },
      { inputs: [7, 6, 4, 3, 1], output: 0 },
      { inputs: [0, 100], output: 100 },
      { inputs: [100, 0], output: 0 },
      { inputs: [333, 334], output: 1 },
      { inputs: [1, 0, 10, 1, 30, 20, 0, 20, 15, 2, 100], output: 100 },
    ],
  },
  {
    markdown: `# FizzBuzz
Given an integer n, return a string array answer (1-indexed) where:

- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.

## Example 1:
Input: n = 5

Output: ["1", "2", "Fizz", "4", "Buzz"]

## Example 2:
Input: n = 15

Output: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]
`,
    proto: {
      name: "fizzBuzz",
      args: ["n"],
    },
    tests: [
      { inputs: [3], output: ["1", "2", "Fizz"] },
      { inputs: [5], output: ["1", "2", "Fizz", "4", "Buzz"] },
      {
        inputs: [10],
        output: [
          "1",
          "2",
          "Fizz",
          "4",
          "Buzz",
          "Fizz",
          "7",
          "8",
          "Fizz",
          "Buzz",
        ],
      },
      {
        inputs: [15],
        output: [
          "1",
          "2",
          "Fizz",
          "4",
          "Buzz",
          "Fizz",
          "7",
          "8",
          "Fizz",
          "Buzz",
          "11",
          "Fizz",
          "13",
          "14",
          "FizzBuzz",
        ],
      },
      { inputs: [1], output: ["1"] },
      { inputs: [0], output: [] },
    ],
  },
  {
    markdown: `# Count Vowels
Given a string s, return the number of vowels (a, e, i, o, u) in the string. Assume the string only contains lowercase English letters.

## Example 1:
Input: s = "hello"

Output: 2

## Example 2:
Input: s = "world"

Output: 1
`,
    proto: {
      name: "countVowels",
      args: ["s"],
    },
    tests: [
      { inputs: ["hello"], output: 2 },
      { inputs: ["world"], output: 1 },
      { inputs: ["aeiou"], output: 5 },
      { inputs: ["bcdfg"], output: 0 },
    ],
  },
  {
    markdown: `# Two Sum
Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target.

- Each input has exactly one solution, and you may not use the same element twice.

## Example 1:
Input: nums = [2, 7, 11, 15], target = 9

Output: [0, 1]

Explanation: nums[0] + nums[1] == 9, so we return [0, 1].

## Example 2:
Input: nums = [3, 2, 4], target = 6

Output: [1, 2]
`,
    proto: {
      name: "twoSum",
      args: ["nums", "target"],
    },
    tests: [
      { inputs: [[2, 7, 11, 15], 9], output: [0, 1] },
      { inputs: [[3, 2, 4], 6], output: [1, 2] },
      { inputs: [[3, 3], 6], output: [0, 1] },
      { inputs: [[1, 2, 3, 4, 5], 9], output: [3, 4] },
    ],
  },
  {
    markdown: `# Maximum in Array
Given an array of numbers nums, return the largest number in the array.

## Example 1:
Input: nums = [3, 1, 4, 1, 5, 9, 2, 6, 5]

Output: 9

## Example 2:
Input: nums = [-10, -3, -1, -4]

Output: -1
`,
    proto: {
      name: "findMax",
      args: ["nums"],
    },
    tests: [
      { inputs: [[1, 3, 2]], output: 3 },
      { inputs: [[-10, -3, -1, -4]], output: -1 },
      { inputs: [[3, 1, 4, 1, 5, 9, 2, 6, 5]], output: 9 },
      { inputs: [[100]], output: 100 },
      { inputs: [[5, 5, 5]], output: 5 },
    ],
  },
];

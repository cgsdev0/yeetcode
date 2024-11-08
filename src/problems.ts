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

class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
  }
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
  {
    markdown: `Given an integer x, return true if x is a palindrome, and false otherwise`,
    proto: {
      name: "isPalindrome",
      args: ["a"],
    },
    tests: [
      { inputs: [121], output: true },
      { inputs: [-121], output: false },
      { inputs: [0], output: true },
      { inputs: [2221], output: false },
    ]
  },
  {
    markdown: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

    An input string is valid if:

        Open brackets must be closed by the same type of brackets.
        Open brackets must be closed in the correct order.
        Every close bracket has a corresponding open bracket of the same type.
`,
    proto: {
      name: 'isValid',
      args: ["s"]
    },
    tests: [
      { inputs: ["()"], output: true },
      { inputs: ["(){}[]"], output: true },
      { inputs: ["(]"], output: false },
      { inputs: ["(()[]{}{})"], output: true },
      { inputs: ["{{}}()(()())"], output: true }
    ]
  },
  {
    markdown: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

    Example 1:

      Input: root = [1,null,2,3]

      Output: [1,3,2]

    Example 2:

      Input: root = [1,2,3,4,5,null,8,null,null,6,7,9]

      Output: [4,2,6,5,7,1,3,9,8]
    `,
    proto: {
      name: "inorderTraversal",
      args: ["root"],
    },
    tests: [
      {
        inputs: [new TreeNode(0, new TreeNode(1), new TreeNode(2))], output: [1, 0, 2]
      },
      {
        inputs: [new TreeNode(0, new TreeNode(1), new TreeNode(2, new TreeNode(3), new TreeNode(4)))], output: [1, 0, 3, 2, 4]
      }
    ]
  },
  {
    markdown: `Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).`,
    proto: {
      name: "isSymmetric",
      args: ["root"],
    },
    tests: [
      { inputs: [new TreeNode(0, new TreeNode(1), new TreeNode(2))], output: true },
      { inputs: [new TreeNode(0, new TreeNode(1), new TreeNode(2, new TreeNode(3), new TreeNode(4)))], output: false },
    ]
  },
  {
    markdown: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

    You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

    Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

    Example 1:

    Input: prices = [7,1,5,3,6,4]
    Output: 5
    Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
    Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.

    Example 2:

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
    ]
  }
];

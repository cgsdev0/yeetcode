import("https://cdn.jsdelivr.net/npm/acorn@8.12.1/dist/acorn.min.js");

function prepareToPrint(obj) {
  if (typeof obj === "object") {
    return JSON.stringify(obj, null, 4);
  }
  return obj;
}

function parseAndValidate(code) {
  try {
    acorn?.parse(code, { ecmaVersion: 2020, sourceType: "module" });
  } catch (err) {
    console.error("AHHHHHHHHHH");
    postMessage({
      error: `Syntax Error ${err.message} at Line: ${err.loc.line}, Column: ${err.loc.column}`,
    });
    throw err;
  }
}

addEventListener(
  "message",
  async (e) => {
    if (e.data.type === "HELLO") {
      console.log("hi :)");
      return;
    }
    if (e.data.type === "WORKER_READY") {
      postMessage({
        ready: true,
      });
      return;
    }

    if (e.data.type !== "EXEC_CODE") {
      throw new Error("bad data type in worker" + e.data.type);
    }

    function runTest(code, problem, test) {
      postMessage({
        clear: true,
      });
      const result = new Function(
        code +
          `; return ${problem.proto.name}(${test.inputs.map((a) => JSON.stringify(a)).join(",")});`,
      )();
      return {
        result,
        correct: JSON.stringify(result) === JSON.stringify(test.output),
        problem,
        test,
      };
    }

    try {
      const oldLog = console.log;
      console.log = (...lines) => {
        oldLog(lines.join("\n"));
        const printables = lines.map((line) => prepareToPrint(line));
        postMessage({
          message: printables.join(" "),
        });
      };
      try {
        let results = [];
        parseAndValidate(e.data.code);
        for (const test of e.data.problem.tests) {
          const result = runTest(e.data.code, e.data.problem, test);
          results.push(result);
          if (!result.correct) break;
        }
        postMessage({
          done: true,
          results,
        });
      } catch (err) {
        postMessage({
          error: err,
        });
        console.log = oldLog;
        return;
      }
      console.log = oldLog;
    } catch (err) {
      postMessage({
        error: `${err}`,
      });
      return;
    }
  },
  false,
);

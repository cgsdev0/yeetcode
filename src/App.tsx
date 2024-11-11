import { useEffect, useCallback, useContext, useRef, useState } from "react";
import "./App.css";
//@ts-ignore
import { attachComments } from "astravel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import * as acorn from "acorn";
import { minify } from "terser";
import { generate } from "astring";
import Markdown from "react-markdown";

import Editor from "@monaco-editor/react";
import { WorkerContext } from "./worker_context.ts";
import { Proto, Test, problems } from "./problems.ts";
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { Player, update } from "./serverSlice.ts";
import { BounceLoader } from "react-spinners";

function incrementIntegersInString(str: string) {
  // Use a regular expression to match integers in the string
  return str.replace(/\d+/g, (match) => {
    // Increment the matched integer by 1
    return `${parseInt(match, 10) + 1}`;
  });
}
const getProto = (proto: Proto) => {
  const item = localStorage.getItem(`code-key-${proto.name}`);
  if (item) return item;
  return `const ${proto.name} = (${proto.args.join(", ")}) => {
\treturn ${proto.args[0]};
}`;
};

interface Result {
  result: any;
  correct: boolean;
  test: Test;
}

export const rewriteHostname = () => {
  if (window.location.hostname === "code.badcop.live") {
    return "code.badcop.live";
  }
  let portString = "";
  if (window.location.port !== "80") {
    portString = `:8000`;
  }
  return window.location.hostname + portString;
};

const sabotages = [
  "ohgod",
  "barebones",
  "vars",
  "aesthetic",
  "swap",
  "outdent",
  "bigindent",
  "minify",
  "semicolon",
  "greek",
  "lightsout",
] as const;
type Sabotage = (typeof sabotages)[number];

function randomSabotage(): Sabotage {
  return sabotages[Math.floor(Math.random() * sabotages.length)];
}

function App() {
  const pid = useAppSelector((state) => state.server.problem);
  const problem = problems[pid];
  const [value, setValue] = useState(getProto(problem.proto));
  const { worker, restart, lightsOn, lightsOff } = useContext(WorkerContext);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [key, setKey] = useState("0");
  const [attackQueue, setAttackQueue] = useState<Sabotage[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [needsAuth, setNeedsAuth] = useState(false);

  const [modifier, setModifier] = useState<Sabotage | null>(null);

  useEffect(() => {
    if (modifier === "lightsout") {
      lightsOff();
    } else {
      lightsOn();
    }
  }, [modifier]);

  const barebones = modifier === "barebones";
  const ohgod = modifier === "ohgod";
  const indent = modifier === "bigindent" ? 12 : 2;

  const resetState = () => {
    setModifier(null);
    setDone(false);
    setResults([]);
    setLines([]);
    setValue(getProto(problem.proto));
    setAttackQueue([]);
    setError(undefined);
  };

  useEffect(() => {
    resetState();
  }, [problem]);

  const dispatch = useAppDispatch();

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    (async function () {
      let shouldConnect = true;

      const data = await window.fetch(
        `${
          window.location.protocol.endsWith("s:") ? "https" : "http"
        }://${rewriteHostname()}/api/me`,
        { mode: "cors", credentials: "include" },
      );
      const parsed = await data.json();
      if (!parsed.hasOwnProperty("passport")) {
        setNeedsAuth(true);
        return;
      }
      let conjunctionJunction = () => {
        if (!shouldConnect) {
          return null;
        }

        const innerWs = new WebSocket(
          `${
            window.location.protocol.endsWith("s:") ? "wss" : "ws"
          }://${rewriteHostname()}/api/ws`,
        );

        innerWs.onopen = () => {
          console.log("ws open");
        };

        innerWs.onmessage = (e: any) => {
          console.log("ws message");
          try {
            const data = JSON.parse(e.data);
            console.warn(data);
            if (data.type === "world") {
              dispatch(update(data));
            }
            if (data.type === "sabotage") {
              onSabotage(data.kind);
            }
          } catch (e) {
            console.error(e);
          }
        };

        innerWs.onclose = () => {
          console.log(
            `on close - ${!shouldConnect ? "not " : " "}reconnecting`,
          );
          setTimeout(() => {
            if (shouldConnect) {
              wsRef.current = conjunctionJunction();
            }
          }, 1000);
        };

        return innerWs;
      };

      wsRef.current = conjunctionJunction();

      return () => {
        shouldConnect = false;
        console.log("Tearing down");
        wsRef.current?.close();
      };
    })();
  }, []);

  const cancel = () => {
    restart();
    setPending(false);
  };

  const solved =
    !error && results.length > 0 && results[results.length - 1].correct;
  const failed =
    !error && results.length > 0 && !results[results.length - 1].correct;
  const failure = results[results.length - 1];

  const remount = () => {
    setKey(`${+key + 1}`);
  };
  useEffect(() => {
    if (!attackQueue.length) return;
    try {
      var comments: any[] = [];
      const ast = acorn?.parse(value, {
        ecmaVersion: 2020,
        sourceType: "module",
        locations: true,
        onComment: comments,
      });
      attachComments(ast, comments);
      console.log({ ast });
      const attack = attackQueue[0];
      switch (attack) {
        case "minify":
          minify(value, {
            format: { max_line_len: 50, comments: "all" },
            mangle: false,
          }).then((v) => setValue(v.code || value));
          remount();
          break;
      }

      setAttackQueue((a) => a.slice(1));
    } catch (e) {
      // failed to parse - we will try again later
    }
  }, [value, attackQueue]);

  useEffect(() => {
    localStorage.setItem(`code-key-${problem.proto.name}`, value);
  }, [value]);

  useEffect(() => {
    const listen = async (e: any) => {
      if (e.data.hasOwnProperty("done") || e.data.hasOwnProperty("error")) {
        setPending(false);
        setError(undefined);
      }
      if (e.data.error) {
        console.error(e.data.error);
        setError(`${e.data.error.stack}`);
      }
      if (e.data.message) {
        setLines((l) => {
          if (l.length === 200) {
            const msg = "Too many lines, stopping here...";
            return [...l, msg];
          }
          if (l.length > 200) return l;
          return [...l, e.data.message];
        });
      }
      if (e.data.clear) {
        setLines([]);
      }

      if (e.data.done) {
        setResults(e.data.results);
        if (e.data.results[e.data.results.length - 1].correct) {
          console.warn("sending done");
          wsRef.current?.send("done");
          setDone(true);
        }
      }
    };
    worker.addEventListener("message", listen);
    return () => {
      worker.removeEventListener("message", listen);
    };
  }, [worker]);

  const onSabotage = useCallback((s: Sabotage) => {
    console.warn("Attack: ", s);
    switch (s) {
      case "semicolon":
        const idx = Math.floor(Math.random() * value.length);
        setValue((v) => v.slice(0, idx) + ";" + v.slice(idx));
        remount();
        break;
      case "swap":
        let options = [];
        if (value.includes("{") || value.includes("}")) {
          options.push("{");
        }
        if (value.includes("[") || value.includes("]")) {
          options.push("[");
        }
        if (value.includes("(") || value.includes(")")) {
          options.push("(");
        }
        if (value.includes("<") || value.replaceAll("=>", "").includes(">")) {
          options.push("<");
        }
        if (!options.length) break;
        let which = Math.floor(Math.random() * options.length);
        if (options[which] === "{") {
          setValue((v) =>
            v
              .replaceAll("{", "SWAP_PLACEHOLDER_LOL")
              .replaceAll("}", "{")
              .replaceAll("SWAP_PLACEHOLDER_LOL", "}"),
          );
        }
        if (options[which] === "[") {
          setValue((v) =>
            v
              .replaceAll("[", "SWAP_PLACEHOLDER_LOL")
              .replaceAll("]", "[")
              .replaceAll("SWAP_PLACEHOLDER_LOL", "]"),
          );
        }
        if (options[which] === "(") {
          setValue((v) =>
            v
              .replaceAll("(", "SWAP_PLACEHOLDER_LOL")
              .replaceAll(")", "(")
              .replaceAll("SWAP_PLACEHOLDER_LOL", ")"),
          );
        }
        if (options[which] === "<") {
          setValue((v) =>
            v
              .replaceAll("=>", "WAIT_DONT_SWAP_THAT")
              .replaceAll("<", "SWAP_PLACEHOLDER_LOL")
              .replaceAll(">", "<")
              .replaceAll("SWAP_PLACEHOLDER_LOL", ">")
              .replaceAll("WAIT_DONT_SWAP_THAT", "=>"),
          );
        }
        remount();
        break;
      case "greek":
        setValue((v) => v.replaceAll(";", ";"));
        remount();
        break;
      case "outdent":
        setValue((v) => v.replaceAll("\t", ""));
        remount();
        break;
      case "ohgod":
      case "barebones":
      case "bigindent":
      case "lightsout":
        setModifier(s);
        break;
      case "aesthetic":
        setValue((v) => v.replaceAll("\n", "\n\n\n"));
        remount();
        break;
      case "vars":
        setValue((v) => incrementIntegersInString(v));
        remount();
        break;
      case "minify":
        setAttackQueue((q) => {
          if (q.includes(s)) return q;
          return [...q, s];
        });
        break;
      default:
        const exhaustiveCheck: never = s; // This line ensures exhaustiveness
        throw new Error(`Unhandled sabotage: ${exhaustiveCheck}`);
    }
  }, []);

  const onReset = useCallback(() => {
    localStorage.removeItem(`code-key-${problem.proto.name}`);
    setValue(getProto(problem.proto));
  }, [value]);
  const signin = () => {
    window.location.href = `${
      window.location.protocol.endsWith("s:") ? "https" : "http"
    }://${rewriteHostname()}/api/auth/twitch`;
  };
  const onSubmit = useCallback(() => {
    worker.postMessage({
      type: "EXEC_CODE",
      code: `"use strict"; ${value}`,
      problem,
    });
    setPending(true);
  }, [value]);

  const pc = useAppSelector((state) => state.server.players.length);
  if (needsAuth) {
    return (
      <div
        style={{
          height: "100dvh",
          overflow: "hidden",
          flexDirection: "column",
          gap: 32,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>yeetcode</h1>
        <button className="twitch" onClick={signin}>
          Signin with Twitch
        </button>
      </div>
    );
  }
  if (!pc)
    return (
      <div
        style={{
          height: "100dvh",
          overflow: "hidden",
          flexDirection: "column",
          gap: 32,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Waiting for approval...</h1>
        <BounceLoader color={"rgb(54, 215, 183)"} />
      </div>
    );
  return (
    <PanelGroup autoSaveId="H" direction="horizontal">
      <Panel defaultSize={40}>
        <div
          id="left"
          style={{ height: "100dvh", borderRight: "1px solid #555" }}
        >
          <div
            style={{
              width: "100%",
              height: "calc(100dvh - 56px)",
              overflowY: "auto",
            }}
          >
            <div
              className="problem"
              style={{
                width: "100%",
                maxWidth: "30vw",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Markdown>{problem.markdown}</Markdown>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              borderTop: "1px solid #555",
              height: "64px",
              minHeight: "64px",
              width: "100%",
            }}
          >
            <Players />
          </div>
        </div>
      </Panel>
      <PanelResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="V" direction="vertical">
          <Panel defaultSize={70} className="relative">
            <Editor
              className={ohgod ? "flipped" : ""}
              key={key}
              width="100%"
              height="100%"
              theme="vs-dark"
              language={barebones ? "test" : "javascript"}
              value={value}
              onChange={(s) => setValue(s || "")}
              options={{
                "semanticHighlighting.enabled": false,
                tabSize: indent,
                useTabStops: true,
                fontSize: 28,
              }}
            />
            {done ? null : (
              <div className="submitrow">
                <button className="submit" onClick={onSubmit}>
                  Submit
                </button>
                <button className="reset" onClick={onReset}>
                  Reset
                </button>
              </div>
            )}
            {pending ? (
              <div className="running">
                <p>Your code is running...</p>
                <button className="cancel" onClick={cancel}>
                  Cancel
                </button>
              </div>
            ) : null}
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <div
              style={{
                borderTop: "1px solid #555",
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              {error ? (
                <div className="error" style={{ padding: 16 }}>
                  <h2>Error</h2>
                  <pre>{error}</pre>
                </div>
              ) : null}
              {solved ? (
                <div style={{ padding: 16 }}>
                  <h2>Solved!</h2>
                  <p>You passed all {results.length} test cases</p>
                </div>
              ) : null}
              <div className="yikes">
                {failed ? (
                  <Failure result={failure} idx={results.length} />
                ) : null}
                {failed ? <Console lines={lines} /> : null}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

const Console = ({ lines }: { lines: string[] }) => {
  return (
    <div className="console">
      <h2>Console</h2>
      <div className="box">
        {lines.map((line, i) => (
          <pre key={`${i}`}>{line}</pre>
        ))}
      </div>
    </div>
  );
};
const Players = () => {
  const players = useAppSelector((state) => state.server.players);
  return (
    <>
      {players.map((p) => (
        <PlayerC player={p} key={p.id} />
      ))}
    </>
  );
};

const PlayerC = ({ player }: { player: Player }) => {
  return (
    <div
      className={`avatar${!player.connected ? " disconnected" : ""}${player.done ? " done" : ""}`}
    >
      <img src={player.profile_image_url} />
    </div>
  );
};

const Failure = ({ idx, result }: { idx: number; result: Result }) => {
  return (
    <div className="failure">
      <h2>Test #{idx} failed</h2>
      <div>
        <div>Your Output</div>
        <pre>{JSON.stringify(result.result, null, 4)}</pre>
      </div>
      <div>
        <div>Expected Output</div>
        <pre>{JSON.stringify(result.test.output, null, 4)}</pre>
      </div>
      <div>
        <div>Test Inputs</div>
        <pre>
          {result.test.inputs.map((a) => JSON.stringify(a, null, 4)).join("\n")}
        </pre>
      </div>
    </div>
  );
};

export default App;

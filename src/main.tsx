import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useCallback, useContext, useRef, useState } from "react";
import "./index.css";
import App from "./App.tsx";
import { WorkerContext } from "./worker_context.ts";

import MyWorker from "./worker?worker";

import { store } from "./store";
import { Provider } from "react-redux";

//@ts-ignore
function update(e) {
  var x = e.clientX || e.touches[0].clientX;
  var y = e.clientY || e.touches[0].clientY;

  document.documentElement.style.setProperty("--cursorX", x + "px");
  document.documentElement.style.setProperty("--cursorY", y + "px");
}

const lightsOff = () =>
  document.documentElement.style.setProperty("--show", "block");
const lightsOn = () =>
  document.documentElement.style.setProperty("--show", "none");
lightsOn();
document.addEventListener("mousemove", update);
document.addEventListener("touchmove", update);

const WorkerThing = () => {
  const [worker, setWorker] = useState(new MyWorker());

  const restart = () => {
    worker.terminate();
    setWorker(new MyWorker());
  };

  return (
    <WorkerContext.Provider value={{ worker, restart, lightsOn, lightsOff }}>
      <App />
    </WorkerContext.Provider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <WorkerThing />
    </Provider>
  </StrictMode>,
);

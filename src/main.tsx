import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useCallback, useContext, useRef, useState } from "react";
import "./index.css";
import App from "./App.tsx";
import { WorkerContext } from "./worker_context.ts";

import MyWorker from "./worker?worker";

import { store } from "./store";
import { Provider } from "react-redux";

const WorkerThing = () => {
  const [worker, setWorker] = useState(new MyWorker());

  const restart = () => {
    worker.terminate();
    setWorker(new MyWorker());
  };

  return (
    <WorkerContext.Provider value={{ worker, restart }}>
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

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTracing } from "./lib/tracing";

initTracing();

createRoot(document.getElementById("root")!).render(<App />);

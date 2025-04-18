import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

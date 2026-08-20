import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SIHProvider } from "./context/SIHContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SIHProvider>
      <App />
    </SIHProvider>
  </StrictMode>
);


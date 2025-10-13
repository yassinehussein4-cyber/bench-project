import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { CmsProvider } from "./cms-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CmsProvider>
        <App />
      </CmsProvider>
    </BrowserRouter>
  </StrictMode>,
);

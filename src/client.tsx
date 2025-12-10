import { createRoot } from "react-dom/client";
import App from "./App";
import NotFound from "./NotFound";
import { PageData, NotFoundData } from "./types";
import "./index.css";

declare global {
  interface Window {
    __SERVER_DATA__: PageData;
  }
}

const pageData = window.__SERVER_DATA__;

// Check if it's a 404 page
const isNotFound = (data: PageData): data is NotFoundData => {
  return "type" in data && data.type === "notfound";
};

createRoot(document.getElementById("root")!).render(
  isNotFound(pageData) ? (
    <NotFound method={pageData.method} path={pageData.path} />
  ) : (
    <App serverData={pageData} />
  )
);

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);

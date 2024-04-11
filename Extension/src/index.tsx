import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { prefersDarkMode } from "./services/themeService";
import './styles.css'


// Add the actual content
const AppWrapper = () => {
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = isDarkMode ? "dark" : "light";

  return (
    <div className={theme}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </div>
  );
};


// Create your HTML file
const root = document.createElement("div");
root.className = "root";
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);

rootDiv.render(
  <AppWrapper />
);
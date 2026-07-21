// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { LoadScript } from "@react-google-maps/api";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import App from "./App.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

const apiKey = "AIzaSyDtpXRh_z9V8TzMS5HblhWU7YSnQ";

// Create root without TypeScript syntax
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
      <App />
    </LoadScript>
  </ThemeProvider>
);

import React from "react";
import ReactDOM from "react-dom";
import { LoadScript } from "@react-google-maps/api";
import "./index.css";
import App from "./App2";  // Changed from "./App" to "./App2"
import reportWebVitals from "./reportWebVitals";
const apiKey = "AIzaSyDtpXRh_z9V8TzMS5HblhWU7YSnQ";
ReactDOM.render(
  <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
    <App />
  </LoadScript>,
  document.getElementById("root") as HTMLElement
);
reportWebVitals();
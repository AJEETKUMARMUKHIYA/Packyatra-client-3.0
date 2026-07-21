import React from "react";
import ReactDOM from "react-dom";
import { LoadScript } from "@react-google-maps/api";
import App from "./App";

const apiKey = "AIzaSyDtpXRh_z9V8Tben7MnzMS5HblhWU7YSnQ";

ReactDOM.render(
  <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
    <App />
  </LoadScript>,
  document.getElementById("root")
);

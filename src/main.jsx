import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import { LearningProvider } from "./context/LearningContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <LearningProvider>
        <App />
      </LearningProvider>
    </ChakraProvider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { ContextProvider } from "./SocketProvider";
import "./style.css";
import { ChakraProvider } from "@chakra-ui/react";
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
<ChakraProvider>
<ContextProvider>
        <App />
        </ContextProvider>
</ChakraProvider>
  // </React.StrictMode>
);
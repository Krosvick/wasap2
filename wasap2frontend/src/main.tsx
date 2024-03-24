import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./providers/reactQueryProvider.ts";
import Routes from "./providers/routesProvider.tsx";

//routes

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <Routes />
      </NextUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

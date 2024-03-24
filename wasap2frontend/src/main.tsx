import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./providers/reactQueryProvider.ts";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//routes
import Root from "./routes/root.tsx";
import ErrorPage from "./routes/errorPage.tsx";
import Contact from "./routes/contact.tsx";
import LoginPage from "./routes/auth/login.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/contacts/:contactid",
        element: <Contact />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <RouterProvider router={router} />
      </NextUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

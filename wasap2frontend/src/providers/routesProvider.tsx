import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "./authUtils";
import { ProtectedRoute } from "../routes/protectedRoute";
import Chat from "../routes/chats";
import { conversationLoader } from "../routes/chats";

import Root from "../routes/root";
import LoginPage from "../routes/auth/login";
import RegisterPage from "../routes/auth/register";
import Index from "../routes/contactsIndex";

const Routes = () => {
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "/about-us",
      element: <div>About Us</div>,
    },
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: "/",
          element: <Root />,
          children: [
            {
              path: "/contact/:conversationId",
              element: <Chat />,
              loader: conversationLoader,
            },
            { index: true, element: <Index /> },
          ],
        },
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import EditPost from "./Pages/EditPost";
import AllPost from "./Pages/AllPost.jsx";
import AddPost from "./Pages/AddPost.jsx";
import Post from "./Pages/Post.jsx";
import NotFound from "./Pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "all-posts",
        element: <AllPost />,
      },
      {
        path: "add-post",
        element: <AddPost />,
      },
      {
        path: "post/:slug",
        element: <Post />,
      },

      {
        path: "edit-post/:slug",
        element: <EditPost />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

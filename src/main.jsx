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
import Home from "./Pages/Home";
import { Authlayout } from "./components/index.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryclient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login",
        element: (
          <Authlayout authentication={false}>
            <Login />
          </Authlayout>
        ),
      },
      {
        path: "signup",
        element: (
          <Authlayout authentication={false}>
            <Signup />
          </Authlayout>
        ),
      },
      {
        path: "all-posts",
        element: (
          <Authlayout authentication={true}>
            <AllPost />
          </Authlayout>
        ),
      },
      {
        path: "add-post",
        element: (
          <Authlayout>
            <AddPost />
          </Authlayout>
        ),
      },
      {
        // Only :id is used to load the post; :slug just makes the URL readable.
        path: "post/:slug/:id",
        element: (
          <Authlayout authentication={true}>
            <Post />
          </Authlayout>
        ),
      },
      {
        // Links shared before ids were unique looked like /post/<old-id>.
        // Post loads them and redirects to the /post/:slug/:id form.
        path: "post/:id",
        element: (
          <Authlayout authentication={true}>
            <Post />
          </Authlayout>
        ),
      },

      {
        path: "edit-post/:id",
        element: (
          <Authlayout authentication={true}>
            <EditPost />
          </Authlayout>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryclient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>,
);

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
import AppToaster from "./components/AppToaster.jsx";
import ErrorPage from "./components/ErrorPage.jsx";

const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    errorElement:<ErrorPage/>,
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
        // Public: anyone can browse the feed without an account.
        path: "all-posts",
        element: <AllPost />,
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
        // Public. Only :id is used to load the post; :slug just makes the URL
        // readable. Drafts stay hidden from guests — see Post.jsx and the read
        // permission in Post.service.js.
        path: "post/:slug/:id",
        element: <Post />,
      },
      {
        // Links shared before ids were unique looked like /post/<old-id>.
        // Post loads them and redirects to the /post/:slug/:id form.
        path: "post/:id",
        element: <Post />,
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
    <QueryClientProvider client={queryClient}>
      <AppToaster />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>,
);

import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Feed } from "./components/Feed";
import { Profile } from "./components/Profile";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { SeedUsers } from "./components/SeedUsers";
import { AccountSettings } from "./components/AccountSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/admin/seed-users",
    element: <SeedUsers />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Feed /> },
      { path: "account", element: <AccountSettings /> },
      { path: "profile/:userId", element: <Profile /> },
    ],
  },
]);
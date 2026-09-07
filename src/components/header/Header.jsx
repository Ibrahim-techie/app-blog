import { Logo, Logoutbtn, Container, Button } from "../../components";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { themeSwitch } from "../../redux/systemSlice";
import { useSelector, useDispatch } from "react-redux";

function Header() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    { name: "Home", url: "/", active: true },
    { name: "All Posts", url: "/all-posts", active: true },
    { name: "Login", url: "/login", active: !authStatus },
    { name: "Signup", url: "/signup", active: !authStatus },
    { name: "Add Post", url: "/add-post", active: authStatus },
  ];

  const [themeMode, setThemeMode] = useState("light");

  // Update Redux
  useEffect(() => {
    dispatch(themeSwitch(themeMode));
  }, [themeMode, dispatch]);

  // Update HTML class
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-gray-200/80
        bg-white/90
        backdrop-blur-md
        dark:border-gray-800/80
        dark:bg-gray-950/90
      "
    >
      <Container>
        <nav className="flex min-h-18 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="shrink-0 transition-opacity duration-200 hover:opacity-80"
          >
            <Logo width="90px" />
          </Link>

          {/* Navigation */}
          <ul className="flex items-center gap-1">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `relative block rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ),
            )}

            {/* Theme Toggle */}
            <li className="ml-2 border-l border-gray-200 pl-3 dark:border-gray-800">
              <Button
                type="button"
                onClick={toggleTheme}
                bgColor="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                textColor="text-gray-700 dark:text-gray-200"
                className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                {themeMode === "light" ? "☀️" : "🌙"}
              </Button>
            </li>

            {/* Logout */}
            {authStatus && (
              <li className="ml-1">
                <Logoutbtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;

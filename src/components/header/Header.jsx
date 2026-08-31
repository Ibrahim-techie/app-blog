
import { Logo, Logoutbtn, Container } from "../../components";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    { name: "Home", url: "/", active: true },
    { name: "All Posts", url: "/all-posts", active: true },
    { name: "Login", url: "/login", active: !authStatus },
    { name: "Signup", url: "/signup", active: !authStatus },
    { name: "Add Post", url: "/add-post", active: authStatus },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
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
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ),
            )}

            {/* Logout */}
            {authStatus && (
              <li className="ml-2 border-l border-gray-200 pl-3">
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


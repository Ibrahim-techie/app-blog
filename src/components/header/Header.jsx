import { Logo, Logoutbtn, Container } from "../../components";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    { name: "Home", url: "/", active: true },
    { name: "Login", url: "/login", active: !authStatus },
    { name: "Signup", url: "/signup", active: !authStatus },
    { name: "All Posts", url: "/all-posts", active:true},
    { name: "Add Post", url: "/add-post", active: authStatus },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <Container>
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <Logo width="70px" />
            </Link>
          </div>

          {/* Nav Items */}
          <ul className="flex items-center gap-4">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={nanoid()}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-full transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 hover:bg-blue-100"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ),
            )}

            {/* Logout Button */}
            {authStatus && (
              <li>
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

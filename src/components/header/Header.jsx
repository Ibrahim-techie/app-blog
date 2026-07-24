import { Logo, Logoutbtn, Container } from "../../components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { NavLink } from "react-router-dom";
function Header() {
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    {
      name: "Home",
      url: "/",
      active: true,
    },
    {
      name: "Login",
      url: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      url: "/signup",
      active: !authStatus,
    },
    {
      name: "All Posts",
      url: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      url: "/add-post",
      active: authStatus,
    },
  ];

  return (
    <header>
      <Container>
        <nav>
          <div>
            <Link to="/">
              <Logo width="70px" />
            </Link>
          </div>

          <ul>
            {navItems.map((item) =>
              item.active ? (
                <li key={nanoid()}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      `inline-block px-6 py-2 duration-200 rounded-full ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "hover:bg-blue-100"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ) : null,
            )}

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

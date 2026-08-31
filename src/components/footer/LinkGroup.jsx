import { Link } from "react-router-dom";
function LinkGroup({ title, links }) {
  return (
    <div>
      <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h3>

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LinkGroup;

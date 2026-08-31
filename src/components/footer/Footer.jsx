import { Link } from "react-router-dom";
import Logo from "../Logo";
import LinkGroup from "./LinkGroup";

function Footer() {
  const companyLinks = [
    { name: "Features", path: "/" },
    { name: "Pricing", path: "/" },
    { name: "Affiliate Program", path: "/" },
    { name: "Press Kit", path: "/" },
  ];

  const supportLinks = [
    { name: "Account", path: "/" },
    { name: "Help", path: "/" },
    { name: "Contact Us", path: "/" },
    { name: "Customer Support", path: "/" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", path: "/" },
    { name: "Privacy Policy", path: "/" },
    { name: "Licensing", path: "/" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gray-950 text-white">
      {/* Decorative background */}
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <Logo width="110px" />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">
              A modern platform to create, share, and discover meaningful
              content. Built with simplicity and performance in mind.
            </p>

            {/* Social Icons */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-sm text-gray-400 transition-all duration-200 hover:border-gray-700 hover:bg-gray-800 hover:text-white"
                aria-label="GitHub"
              >
                GH
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-sm text-gray-400 transition-all duration-200 hover:border-gray-700 hover:bg-gray-800 hover:text-white"
                aria-label="LinkedIn"
              >
                in
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-sm text-gray-400 transition-all duration-200 hover:border-gray-700 hover:bg-gray-800 hover:text-white"
                aria-label="Twitter"
              >
                X
              </a>
            </div>
          </div>

          {/* Company */}
          <LinkGroup title="Company" links={companyLinks} />

          {/* Support */}
          <LinkGroup title="Support" links={supportLinks} />

          {/* Legal */}
          <LinkGroup title="Legal" links={legalLinks} />
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevUI. All rights reserved.</p>

          <p>
            Built with <span className="text-gray-300">React</span> &{" "}
            <span className="text-gray-300">Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

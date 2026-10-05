import inkLogoLight from "../assets/ink-logo-light.svg";
import inkLogoDark from "../assets/ink-logo-dark.svg";

/**
 * The INK compact lockup, exported from the INK Figma logo page. Each theme
 * has its own artwork; CSS picks one, so there is no flash while JS loads.
 */
function InkLogo({ className = "" }) {
  return (
    <span className={`inline-block ${className}`}>
      <img
        src={inkLogoLight}
        alt="INK"
        width={120}
        height={42}
        className="block dark:hidden"
      />
      <img
        src={inkLogoDark}
        alt="INK"
        width={120}
        height={42}
        className="hidden dark:block"
      />
    </span>
  );
}

export default InkLogo;

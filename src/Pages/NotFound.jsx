import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center px-5 py-16 sm:px-10">
      <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-brand">
        ERROR 404
      </p>
      <h1 className="mt-3 text-[56px] font-extrabold leading-[0.98] tracking-[-3.36px] text-ink-text sm:text-[84px] sm:tracking-[-5.04px]">
        PAGE NOT
        <br />
        FOUND.
      </h1>

      <p className="mt-6 max-w-md text-[15px] leading-[1.65] text-ink-text-2">
        Sorry, the page you are looking for doesn&apos;t exist or may have been
        moved.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex h-12 items-center rounded-[3px] border border-ink-border-strong bg-ink-primary px-5 text-xs font-extrabold text-ink-on-primary"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;

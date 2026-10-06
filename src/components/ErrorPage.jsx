import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

// Rendered by the router *instead of* App, so there's no shell here — only
// the INK colours, which still follow the theme class index.html applied.
function ErrorPage() {
  const error = useRouteError();

  console.error(error);

  const heading = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Oops!";
  const detail = isRouteErrorResponse(error)
    ? error.data?.message || "Something went wrong."
    : error?.message || "Unknown error occurred.";

  return (
    <div className="flex min-h-screen flex-col items-start justify-center bg-ink-bg px-5 sm:px-10">
      <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-error">
        SOMETHING BROKE
      </p>
      <h1 className="mt-3 text-[48px] font-semibold leading-[1] tracking-[-2.4px] text-ink-text">
        {heading}
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-ink-text-2">
        {detail}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex h-12 items-center rounded-lg border border-ink-border-strong bg-ink-primary px-5 text-xs font-semibold text-ink-on-primary"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default ErrorPage;

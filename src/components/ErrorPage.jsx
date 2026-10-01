import { useRouteError, isRouteErrorResponse } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    // Error is a Response (like 404, 500)
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data?.message || "Something went wrong."}</p>
      </div>
    );
  }

  // Error is a normal JS Error
  return (
    <div>
      <h1>Oops!</h1>
      <p>{error.message || "Unknown error occurred."}</p>
    </div>
  );
}

export default ErrorPage;

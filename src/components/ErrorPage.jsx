import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>We couldn't load this page.</p>
    </div>
  );
}

export default ErrorPage;
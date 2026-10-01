

function UserName({ userName }) {
  return (
    <span
      className="text-sm font-medium text-gray-100 hover:text-indigo-400 transition-colors"
      aria-label={`Signed in as ${userName}`}
    >
      {userName || "Guest"}
    </span>
  );
}

export default UserName;

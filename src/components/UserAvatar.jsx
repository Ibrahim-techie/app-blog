import fileservice from "../services/storage.service";

function initials(name) {
  const letters = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return letters || "?";
}

/**
 * A square INK avatar: the uploaded photo when there is one, initials
 * otherwise. Colours and type size come from the caller, because the header,
 * cards and comments each use a different pairing in the design.
 */
function UserAvatar({ name, avatarId, size = 34, className = "" }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden font-extrabold leading-none ${className}`}
    >
      {avatarId ? (
        <img
          src={fileservice.filePreview(avatarId)}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export default UserAvatar;

import UserAvatar from "./UserAvatar";
import useAuthorProfile from "../customHooks/useAuthorProfile";

/**
 * Any user's avatar by id: their public profile photo when they have one,
 * initials otherwise. Lookups from the same render are batched into one
 * request (useAuthorProfile).
 */
function AuthorAvatar({ userId, name, ...props }) {
  const profile = useAuthorProfile(userId);
  return (
    <UserAvatar
      name={name || profile?.name}
      avatarId={profile?.avatarId}
      {...props}
    />
  );
}

export default AuthorAvatar;

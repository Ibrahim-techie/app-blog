import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import profileservice from "../services/profile.service";

// Every card, byline and comment asks for its own author, but a page of them
// renders together. Requests made in the same tick are collected and sent as
// one listRows call, so a grid of twelve cards costs one request, not twelve.
let pending = new Map(); // userId → [{ resolve, reject }]
let scheduled = false;

async function flush() {
  const batch = pending;
  pending = new Map();
  scheduled = false;

  try {
    const profiles = await profileservice.getProfiles([...batch.keys()]);
    for (const [userId, waiters] of batch) {
      for (const { resolve } of waiters) resolve(profiles[userId] ?? null);
    }
  } catch (error) {
    for (const waiters of batch.values()) {
      for (const { reject } of waiters) reject(error);
    }
  }
}

function loadProfile(userId) {
  return new Promise((resolve, reject) => {
    if (!pending.has(userId)) pending.set(userId, []);
    pending.get(userId).push({ resolve, reject });
    if (!scheduled) {
      scheduled = true;
      setTimeout(flush, 0);
    }
  });
}

/**
 * The public profile (name, bio, avatarId) of any user, or null when they
 * haven't got one yet.
 *
 * For the signed-in user it answers from their own account instead, so a
 * photo or bio they just changed shows everywhere at once.
 */
function useAuthorProfile(userId) {
  const me = useSelector((state) => state.auth.userData);
  const isMe = Boolean(userId && me?.$id === userId);

  const query = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => loadProfile(userId),
    enabled: Boolean(userId) && !isMe,
    staleTime: 5 * 60_000,
  });

  if (isMe) {
    return {
      name: me.name,
      bio: me.prefs?.bio || null,
      avatarId: me.prefs?.avatarId || null,
    };
  }
  return query.data ?? null;
}

export default useAuthorProfile;

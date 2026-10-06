import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import profileservice, { publicProfile } from "../services/profile.service";

const sameProfile = (a, b) =>
  a.name === b.name &&
  (a.bio ?? null) === (b.bio ?? null) &&
  (a.avatarId ?? null) === (b.avatarId ?? null);

/**
 * Keeps the signed-in user's public profile row in step with their account.
 *
 * Runs whenever the account in Redux changes — on sign-in, on app load, and
 * after Edit Profile dispatches the updated user — so existing users get a
 * row the next time they open the app, and every later change is copied
 * across. Writes only when something actually differs.
 */
function useProfileSync() {
  const user = useSelector((state) => state.auth.userData);
  const queryClient = useQueryClient();

  const userId = user?.$id;
  const name = user?.name;
  const bio = user?.prefs?.bio;
  const avatarId = user?.prefs?.avatarId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const wanted = publicProfile({ name, prefs: { bio, avatarId } });

    (async () => {
      try {
        const stored = (await profileservice.getProfiles([userId]))[userId];
        if (cancelled || (stored && sameProfile(stored, wanted))) return;

        const saved = await profileservice.saveOwnProfile({
          $id: userId,
          name,
          prefs: { bio, avatarId },
        });
        queryClient.setQueryData(["profile", userId], saved);
      } catch (error) {
        // Not fatal: your own screens read your account directly, and the
        // next app load tries again.
        console.log("Profile sync failed :: useProfileSync", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, name, bio, avatarId, queryClient]);
}

export default useProfileSync;

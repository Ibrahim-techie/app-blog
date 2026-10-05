import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import authService from "../services/auth.service";
import fileservice from "../services/storage.service";
import { compressImage } from "../utils/compressImage";
import { login } from "../redux/authSlice";

/**
 * Save the signed-in user's name, bio and avatar.
 *
 * Name lives on the Appwrite account; bio and avatar (a storage file id) live
 * in the account's prefs. Both are written through the current session, so a
 * user can only ever change their own profile.
 *
 * The user is held in Redux, not TanStack Query, so success means dispatching
 * the updated account — the header and profile re-render from that.
 */
function useUpdateProfile() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  return useMutation({
    mutationFn: async ({ name, bio, avatarFile }) => {
      const prefs = userData?.prefs ?? {};
      let newAvatarId = null;

      if (avatarFile) {
        const file = await fileservice.fileUpload(
          await compressImage(avatarFile),
        );
        if (!file) throw new Error("Couldn't upload your photo.");
        newAvatarId = file.$id;
      }

      try {
        if (name !== userData.name) await authService.updateName(name);

        const user = await authService.updatePrefs({
          ...prefs,
          bio,
          ...(newAvatarId && { avatarId: newAvatarId }),
        });

        return { user, replacedAvatarId: newAvatarId && prefs.avatarId };
      } catch (error) {
        // The profile never pointed at the new photo, so don't leave it
        // stranded in storage.
        if (newAvatarId) await fileservice.fileDelete(newAvatarId);
        throw error;
      }
    },

    onSuccess: ({ user, replacedAvatarId }) => {
      dispatch(login(user));
      toast.success("Profile updated");

      // Nothing references the old photo any more. A failed delete is
      // invisible to the user, so it only gets logged.
      if (replacedAvatarId) fileservice.fileDelete(replacedAvatarId);
    },

    onError: (error) => {
      // The name may have saved before the prefs failed. Re-read the account
      // so what's on screen matches what Appwrite actually holds.
      authService.getCurrentUser().then((user) => user && dispatch(login(user)));

      toast.error("Couldn't update your profile", {
        description: error?.message || "Please try again.",
      });
    },
  });
}

export default useUpdateProfile;

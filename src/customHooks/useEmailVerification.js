import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import authService from "../services/auth.service";

/**
 * Whether the signed-in user has proved their inbox, plus a way to resend the
 * link. Unverified accounts can read and save, but not post, comment or like.
 */
function useEmailVerification() {
  const user = useSelector((state) => state.auth.userData);

  const resend = useMutation({
    mutationFn: () => authService.sendVerification(),
    onSuccess: () =>
      toast.success("Verification email sent", {
        description: `Check ${user?.email} and click the link.`,
      }),
    onError: (error) =>
      toast.error("Couldn't send the email", {
        description: error?.message || "Please try again in a minute.",
      }),
  });

  return {
    isSignedIn: Boolean(user),
    isVerified: Boolean(user?.emailVerification),
    email: user?.email,
    resend: () => resend.mutate(),
    isResending: resend.isPending,
  };
}

export default useEmailVerification;

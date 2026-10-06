import useEmailVerification from "../customHooks/useEmailVerification";
import VerifyEmailNotice from "./VerifyEmailNotice";

/** Renders its children only for verified accounts; otherwise the notice. */
function VerifiedOnly({ children, action }) {
  const { isVerified } = useEmailVerification();
  if (isVerified) return children;
  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-16 sm:px-10">
      <VerifyEmailNotice action={action} />
    </div>
  );
}

export default VerifiedOnly;

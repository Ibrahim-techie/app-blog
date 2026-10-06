// Sign-up is open only to addresses from established email providers and
// academic institutions. Throwaway-inbox services register new domains every
// day, faster than any blocklist can keep up with (temp-mail's hudzer.com was
// on none of them), so the only dependable rule is an allowlist.
//
// Anyone whose address isn't covered can still join with Google.

const PROVIDERS = new Set([
  // Google
  "gmail.com",
  "googlemail.com",
  // Microsoft
  "outlook.com",
  "outlook.in",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "live.in",
  "msn.com",
  // Yahoo
  "yahoo.com",
  "yahoo.in",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "rocketmail.com",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // Proton
  "proton.me",
  "protonmail.com",
  "pm.me",
  // Others
  "aol.com",
  "zoho.com",
  "zohomail.in",
  "rediffmail.com",
]);

// Universities and colleges: anything.edu, and the national academic
// second-level domains such as .ac.in, .edu.in, .ac.uk, .edu.au.
const ACADEMIC = /\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2})$/;

/** True when the address may be used to create an account. */
export function isAllowedEmail(email) {
  const domain = email.split("@").pop()?.trim().toLowerCase() ?? "";
  return PROVIDERS.has(domain) || ACADEMIC.test(domain);
}

export const ALLOWED_EMAIL_HINT =
  "Use Gmail, Outlook, Yahoo, iCloud, Proton or your college email — or continue with Google.";

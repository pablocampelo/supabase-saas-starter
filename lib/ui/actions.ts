import type { UiAction, UiActionResult } from "./models";

// Deliberately has no data/credential arguments, network calls or storage writes.
// Replace this adapter only when real server authorization is implemented.
export async function previewAction(action: UiAction): Promise<UiActionResult> {
  const messages: Record<UiAction, string> = {
    "sign-in": "Sign-in is not connected. No session was created. Explore the demo to review the app.",
    "sign-up": "Account creation is not connected. No account was created or email sent.",
    resend: "Email delivery is not connected. No verification email was sent.",
    reset: "Password recovery is not connected. No email was sent and no password was changed.",
    "save-note": "Your changes were not saved. Notes persistence is not connected.",
    "delete-note": "The note was not deleted. Notes persistence is not connected.",
    "save-profile": "Your profile was not saved. Account updates are not connected.",
    checkout: "Checkout is not connected. No payment was initiated or access granted.",
    portal: "The Customer Portal is not connected. No billing changes were made.",
    logout: "There is no authenticated session in this preview. No sign-out request was made.",
  };
  return { kind: "preview-only", message: `UI preview only. ${messages[action]}` };
}

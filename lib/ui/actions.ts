import type { UiAction, UiActionResult } from "./models";

export async function previewAction(action: UiAction): Promise<UiActionResult> {
  const messages: Record<UiAction, string> = {
    google: "Google OAuth is not connected. No provider flow or session was started.",
    "sign-in": "Sign-in is not connected. No session was created. Explore the demo to review the app.",
    "sign-up": "Account creation is not connected. No account was created or email sent.",
    resend: "Email delivery is not connected. No verification email was sent.",
    reset: "Password recovery is not connected. No email was sent and no password was changed.",
    "save-project": "Your changes were not saved. Project persistence is not connected.",
    "delete-project": "The project was not deleted. Persistence is not connected.",
    "save-profile": "Your profile was not saved. Account updates are not connected.",
    checkout: "Checkout is not connected. No payment was initiated or access granted.",
    portal: "The Customer Portal is not connected. No billing changes were made.",
    logout: "There is no authenticated session in this preview. No sign-out request was made.",
  };
  return { kind: "preview-only", message: `UI preview only. ${messages[action]}` };
}

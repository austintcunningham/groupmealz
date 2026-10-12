export function staffInviteSuccessMessage(data: {
  status: "assigned" | "invited";
  email: string;
  emailSent: boolean;
  emailError?: string;
  emailId?: string;
  emailFrom?: string;
  applyError?: string;
}): string {
  const base =
    data.status === "invited"
      ? `${data.email} is invited — they should sign up at /signup with this same email.`
      : `${data.email} now has access (existing account updated).`;

  const emailPart = (() => {
    if (data.emailSent) {
      const idPart = data.emailId ? ` Resend ID: ${data.emailId}.` : "";
      return `Invitation email queued.${idPart} Ask them to check spam and Promotions.`;
    }
    if (data.emailError) {
      const fromPart = data.emailFrom ? ` Sent-from: ${data.emailFrom}.` : "";
      return `Email was not sent (${data.emailError}).${fromPart} Fix Resend / EMAIL_FROM on Vercel, then try Resend email.`;
    }
    return "Email was not sent (Resend not configured).";
  })();

  const applyPart = data.applyError
    ? ` Warning: access update failed (${data.applyError}) — email may still have been sent.`
    : "";

  return `${base} ${emailPart}${applyPart}`;
}

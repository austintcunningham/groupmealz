export function staffInviteEmailFailureMessage(result: {
  emailSent: boolean;
  emailError?: string;
}): string | null {
  if (result.emailSent) return null;
  return (
    result.emailError ??
    "Email was not sent. In Vercel → Production env, set RESEND_API_KEY and EMAIL_FROM (e.g. orders@groupmeals.net on your verified domain), redeploy, then run Admin → Settings → Email delivery → Send test."
  );
}

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
      return `Invitation email queued.${idPart} You should receive a BCC copy at your admin email. Ask them to check spam.`;
    }
    if (data.emailError) {
      const fromPart = data.emailFrom ? ` Sent-from: ${data.emailFrom}.` : "";
      return `Email was not sent (${data.emailError}).${fromPart}`;
    }
    return "Email was not sent (Resend not configured).";
  })();

  const applyPart = data.applyError
    ? ` Warning: access update failed (${data.applyError}) — email may still have been sent.`
    : "";

  return `${base} ${emailPart}${applyPart}`;
}

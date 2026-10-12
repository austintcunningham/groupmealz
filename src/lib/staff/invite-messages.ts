export function staffInviteSuccessMessage(data: {
  status: "assigned" | "invited";
  email: string;
  emailSent: boolean;
  emailError?: string;
}): string {
  const base =
    data.status === "invited"
      ? `${data.email} is invited — they should sign up at /signup with this same email.`
      : `${data.email} now has access (existing account updated).`;

  if (data.emailSent) {
    return `${base} Invitation email sent.`;
  }
  if (data.emailError) {
    return `${base} Email was not sent (${data.emailError}). Check Resend logs and spam.`;
  }
  return `${base} Email was not sent (Resend not configured).`;
}

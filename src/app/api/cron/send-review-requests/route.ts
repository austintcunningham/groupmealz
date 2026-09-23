import { NextResponse } from "next/server";
import { sendDueReviewInvitationEmails } from "@/lib/actions/review-invitations";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueReviewInvitationEmails();
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { sendDueLunchAnnouncements } from "@/lib/actions/announcements";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueLunchAnnouncements();
  return NextResponse.json(result);
}

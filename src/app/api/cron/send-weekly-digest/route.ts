import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/email/weekly-digest";
import { isChicagoWeeklySendWindow } from "@/lib/scheduling/chicago";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  if (!force && !isChicagoWeeklySendWindow()) {
    return NextResponse.json({
      skipped: true,
      reason: "Outside Friday 4:00 PM Central window (use ?force=1 to test)",
    });
  }

  const result = await runWeeklyDigest({ force });
  return NextResponse.json(result);
}

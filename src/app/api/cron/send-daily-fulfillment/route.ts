import { NextResponse } from "next/server";
import {
  isChicagoFulfillmentWindow,
  runDailyFulfillmentCron,
} from "@/lib/email/fulfillment-daily";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  if (!force && !isChicagoFulfillmentWindow()) {
    return NextResponse.json({
      skipped: true,
      reason: "Outside 9:30 AM America/Chicago window (use ?force=1 to test)",
    });
  }

  const result = await runDailyFulfillmentCron(undefined, { force });
  return NextResponse.json(result);
}

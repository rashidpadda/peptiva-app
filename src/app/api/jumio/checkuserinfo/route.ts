import { NextRequest, NextResponse } from "next/server";
import { checkJumioStage } from "@/lib/jumioStage";

// Step 3: interval polling (and resume-on-mount) while the user is on the
// verifying screen - mirrors deposit-onboarding's checkuserinfo call. Same
// underlying Jumio lookup as idsubmit, just triggered on a timer (GET,
// query params) instead of once off the iframe's postMessage (POST, body).
export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const workflowExecutionId = req.nextUrl.searchParams.get("workflowExecutionId");

  if (!accountId || !workflowExecutionId) {
    return NextResponse.json(
      { ok: false, error: "Missing accountId or workflowExecutionId" },
      { status: 400 }
    );
  }

  try {
    const result = await checkJumioStage({ accountId, workflowExecutionId });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to check verification status." },
      { status: 502 }
    );
  }
}

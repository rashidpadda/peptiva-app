import { NextRequest, NextResponse } from "next/server";
import { checkJumioStage } from "@/lib/jumioStage";

// Step 2 (IdFrame -> ...): fired once, when Jumio's hosted iframe posts a
// completion message - mirrors deposit-onboarding's idsubmit call, which
// tells the backend to go fetch the completed submission from Jumio. Here
// there's no separate backend to tell; this route *is* the fetch.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const accountId = body?.accountId;
  const workflowExecutionId = body?.workflowExecutionId;

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

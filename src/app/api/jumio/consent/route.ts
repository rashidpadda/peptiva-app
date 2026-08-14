import { NextResponse } from "next/server";
import { initiateJumioWorkflow, JumioConfigError } from "@/lib/jumio";

// Step 1 (IdCollectConsent -> IdFrame): the user has accepted the consent
// screen client-side (identity-step.tsx shows Jumio's data-collection
// notice before calling this). There's no separate consent payload to send
// on to Jumio itself - accepting consent is what starts the workflow.
export async function POST() {
  try {
    const sessionId = crypto.randomUUID();
    const result = await initiateJumioWorkflow({
      customerInternalReference: `peptiva-quickbuy-${sessionId}`,
      userReference: sessionId,
    });
    return NextResponse.json({
      ok: true,
      stage: "IdFrame",
      accountId: result.accountId,
      workflowExecutionId: result.workflowExecutionId,
      additionalData: { iframeUrl: result.redirectUrl },
    });
  } catch (err) {
    const status = err instanceof JumioConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to start identity verification." },
      { status }
    );
  }
}

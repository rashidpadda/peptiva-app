import { retrieveJumioWorkflowStatus } from "@/lib/jumio";

// Wire vocabulary for the identity step's UI, deliberately modeled after
// deposit-onboarding's JumioStage enum (jumioModels.ts) so both apps' Jumio
// flows read the same way at the component level - even though peptiva has
// no backend of its own and derives these stages itself from Jumio's raw
// workflow-execution status/decision (see mapJumioStatusToStage below),
// rather than receiving them pre-computed from an orchestration backend.
export type JumioStage =
  | "IdCollectConsent"
  | "IdFrame"
  | "FrameCooldown"
  | "AwaitingManualVerification"
  | "Verified"
  | "Rejected"
  | "InternalError";

// Every stage the identity step has a render branch for. Mirrors
// deposit-onboarding's KNOWN_JUMIO_STATUSES catch-all: an unrecognized
// value renders a generic failure screen instead of nothing.
export const KNOWN_JUMIO_STAGES = new Set<JumioStage>([
  "IdCollectConsent",
  "IdFrame",
  "FrameCooldown",
  "AwaitingManualVerification",
  "Verified",
  "Rejected",
  "InternalError",
]);

// Jumio's KYX Orchestration API's complete workflow.status enum, confirmed
// against Jumio's own docs (an earlier guess at the in-progress values -
// "ACQUIRING_DATA"/"PROCESSING" - was wrong and doesn't exist; the real
// value is "ACQUIRED", which caused every poll after a real mobile
// submission to fall through to InternalError until this was fixed):
//   INITIATED       - workflow created, user hasn't started yet
//   ACQUIRED        - user submitted ID/selfie, not yet processed
//   PROCESSED       - finished, decision.type is now populated
//   SESSION_EXPIRED - 15-minute inactivity timeout
//   TOKEN_EXPIRED   - auth token expired mid-flow
// decision.type (once PROCESSED) is PASSED/FAILED/WARNING/NOT_EXECUTED.
export function mapJumioStatusToStage(status: string, decision: string | null): JumioStage {
  if (status === "SESSION_EXPIRED" || status === "TOKEN_EXPIRED") return "FrameCooldown";

  if (status === "PROCESSED") {
    if (decision === "PASSED") return "Verified";
    if (decision === "WARNING") return "AwaitingManualVerification";
    if (decision === "FAILED" || decision === "NOT_EXECUTED" || decision === null) {
      return "Rejected";
    }
    return "InternalError";
  }

  if (status === "INITIATED" || status === "ACQUIRED") {
    return "IdFrame";
  }

  return "InternalError";
}

export type JumioStageCheckResult = {
  stage: JumioStage;
  // Raw values straight from Jumio, alongside the mapped stage - surfaced
  // in the UI (small debug caption on the verifying screen) so a stuck
  // session is diagnosable from a screenshot instead of a guess.
  rawStatus: string;
  rawDecision: string | null;
  additionalData: { iframeUrl?: string } | null;
};

// Shared by idsubmit (one-shot, fired when Jumio's iframe posts a
// completion message) and checkuserinfo (repeated polling + resume-on-mount)
// - both just re-fetch the workflow execution from Jumio and translate it.
export async function checkJumioStage(params: {
  accountId: string;
  workflowExecutionId: string;
}): Promise<JumioStageCheckResult> {
  const { status, decision } = await retrieveJumioWorkflowStatus(params);
  return {
    stage: mapJumioStatusToStage(status, decision),
    rawStatus: status,
    rawDecision: decision,
    additionalData: null,
  };
}

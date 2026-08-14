"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KNOWN_JUMIO_STAGES, type JumioStage } from "@/lib/jumioStage";

type Stage =
  | { kind: "consent" }
  | { kind: "starting" }
  | {
      kind: "verifying";
      iframeUrl: string;
      accountId: string;
      workflowExecutionId: string;
      rawStatus?: string;
      checking?: boolean;
    }
  | { kind: "passed" }
  | { kind: "failed"; reason: string }
  | { kind: "error"; message: string };

// Jumio's hosted KYX Web SDK posts a completion message from an iframe whose
// origin looks like https://<merchant>.web.<region>.jumio.ai (or the legacy
// netverify.com) - mirrors the allowlist deposit-onboarding's JumioIframe.tsx
// uses, adapted to a pattern match since the merchant subdomain varies.
function isJumioOrigin(origin: string): boolean {
  return /^https:\/\/([a-z0-9-]+\.)?(web\.[a-z0-9-]+\.jumio\.ai|netverify\.com)$/i.test(origin);
}

// Jumio's hosted widget shows its own "Success - you can close your browser"
// screen the moment the user finishes (status flips from INITIATED to
// ACQUIRED), which is confusing once it's embedded in a multi-step flow that
// isn't actually done yet. Once that happens the iframe has nothing further
// for the user to do, so it's swapped out for one clean finishing state
// instead of leaving Jumio's "close your browser" card on screen next to
// our own "please wait" message.
function friendlyProgressLabel(rawStatus?: string): string {
  if (rawStatus === "ACQUIRED") return "Analyzing your submission...";
  return "Finishing up...";
}

const POLL_INTERVAL_MS = 3000;

export function IdentityStep({ onContinue }: { onContinue: () => void }) {
  const [stage, setStage] = useState<Stage>({ kind: "consent" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (stage.kind === "passed") {
      const timer = setTimeout(onContinue, 1100);
      return () => clearTimeout(timer);
    }
  }, [stage, onContinue]);

  // Translates a JumioStage returned by idsubmit/checkuserinfo into this
  // component's local UI state. "IdFrame" means Jumio is still processing -
  // stay on the verifying screen and let the poll keep running.
  function applyStage(
    nextStage: JumioStage,
    accountId: string,
    workflowExecutionId: string,
    rawStatus?: string
  ) {
    if (!KNOWN_JUMIO_STAGES.has(nextStage)) {
      if (pollRef.current) clearInterval(pollRef.current);
      setStage({ kind: "error", message: "Something went wrong verifying your identity." });
      return;
    }

    switch (nextStage) {
      case "IdFrame":
        // Still processing - update the visible raw status (e.g. ACQUIRED
        // once Jumio has the submission but hasn't finished deciding) and
        // clear any manual-refresh spinner, but stay on this screen.
        setStage((s) => (s.kind === "verifying" ? { ...s, rawStatus, checking: false } : s));
        return;
      // This is a demo checkout with no real KYC gating behind it - a
      // WARNING decision (Jumio routing a sandbox submission to manual
      // review, common with test documents) shouldn't block the flow the
      // way it would for a real account, so it's treated the same as a
      // pass: once Jumio has actually finished processing the submission,
      // continue to payment either way.
      case "Verified":
      case "AwaitingManualVerification":
        if (pollRef.current) clearInterval(pollRef.current);
        setStage({ kind: "passed" });
        return;
      case "Rejected":
        if (pollRef.current) clearInterval(pollRef.current);
        setStage({ kind: "failed", reason: "We couldn't verify your identity from that submission." });
        return;
      case "FrameCooldown":
        if (pollRef.current) clearInterval(pollRef.current);
        setStage({ kind: "failed", reason: "Your verification session expired." });
        return;
      case "InternalError":
      case "IdCollectConsent":
        if (pollRef.current) clearInterval(pollRef.current);
        setStage({ kind: "error", message: "Something went wrong verifying your identity." });
        return;
    }
  }

  async function checkUserInfo(accountId: string, workflowExecutionId: string) {
    try {
      const res = await fetch(
        `/api/jumio/checkuserinfo?accountId=${accountId}&workflowExecutionId=${workflowExecutionId}`
      );
      const data = await res.json();
      if (!data.ok) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStage({ kind: "error", message: data.error });
        return;
      }
      applyStage(data.stage, accountId, workflowExecutionId, data.rawStatus);
    } catch {
      // Transient network error while polling - let the interval retry rather
      // than surfacing every blip as a hard failure.
    }
  }

  async function idSubmit(accountId: string, workflowExecutionId: string) {
    try {
      const res = await fetch("/api/jumio/idsubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, workflowExecutionId }),
      });
      const data = await res.json();
      if (!data.ok) return; // let the interval poll surface the error
      applyStage(data.stage, accountId, workflowExecutionId, data.rawStatus);
    } catch {
      // Ignored - the interval poll covers this.
    }
  }

  // Manual escape hatch on the verifying screen itself - the 3s auto-poll
  // should catch this on its own, but this lets the user (or diagnosis)
  // force an immediate check instead of waiting up to 3s, and updates the
  // visible raw status right away.
  async function recheckVerifying() {
    if (stage.kind !== "verifying") return;
    const { accountId, workflowExecutionId } = stage;
    setStage({ ...stage, checking: true });
    await checkUserInfo(accountId, workflowExecutionId);
  }

  async function handleStartVerification() {
    setStage({ kind: "starting" });
    try {
      const res = await fetch("/api/jumio/consent", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setStage({ kind: "error", message: data.error });
        return;
      }

      const { accountId, workflowExecutionId } = data;
      setStage({ kind: "verifying", iframeUrl: data.additionalData.iframeUrl, accountId, workflowExecutionId });

      pollRef.current = setInterval(() => {
        checkUserInfo(accountId, workflowExecutionId);
      }, POLL_INTERVAL_MS);
    } catch {
      setStage({ kind: "error", message: "Couldn't reach the verification service. Please try again." });
    }
  }

  useEffect(() => {
    if (stage.kind !== "verifying") return;
    const { accountId, workflowExecutionId } = stage;
    function handleMessage(event: MessageEvent) {
      if (!isJumioOrigin(event.origin)) return;
      // Any postMessage from Jumio's SDK signals activity worth an immediate
      // check instead of waiting for the next poll tick.
      idSubmit(accountId, workflowExecutionId);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function retry() {
    if (pollRef.current) clearInterval(pollRef.current);
    setStage({ kind: "consent" });
  }

  if (stage.kind === "consent" || stage.kind === "starting") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-beige text-sage-dark">
          <IdCard className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-serif text-2xl text-charcoal">Verify your identity</h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
          To help keep accounts secure, we verify identity before completing your first order.
          You&apos;ll need a valid government-issued ID. This step is powered by Jumio, and by
          continuing you consent to Jumio collecting your ID and biometric data to verify your identity.
        </p>
        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={handleStartVerification}
          disabled={stage.kind === "starting"}
        >
          {stage.kind === "starting" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Starting...
            </span>
          ) : (
            "Start verification"
          )}
        </Button>
      </div>
    );
  }

  if (stage.kind === "verifying") {
    // Still INITIATED (or no status yet) - the user is actively using
    // Jumio's widget, so it stays front and center with just a light hint.
    if (!stage.rawStatus || stage.rawStatus === "INITIATED") {
      return (
        <div>
          <h2 className="text-center font-serif text-xl text-charcoal">Complete verification</h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Follow the instructions below to verify your identity.
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border-soft bg-white">
            <iframe
              src={stage.iframeUrl}
              title="Jumio Identity Verification"
              className="h-[560px] w-full"
              allow="camera; microphone"
            />
          </div>
          <p className="mt-3 text-center text-xs text-stone-400">
            This step is handled entirely inside the window above.
          </p>
        </div>
      );
    }

    // The user has finished with Jumio's widget (it's already shown its own
    // "Success, you can close your browser" screen) - replace it with one
    // clean finishing state instead of leaving that alongside our own
    // "please wait" message.
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">{friendlyProgressLabel(stage.rawStatus)}</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          We&apos;re confirming your submission - this usually takes under a minute. No need to do
          anything else here.
        </p>
        <Button
          className="mt-6"
          size="sm"
          variant="ghost"
          onClick={recheckVerifying}
          disabled={stage.checking}
        >
          {stage.checking ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking...
            </span>
          ) : (
            "Check now"
          )}
        </Button>
      </div>
    );
  }

  if (stage.kind === "passed") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-serif text-2xl text-charcoal">Identity verified</h2>
        <p className="mt-1 text-sm text-stone-500">Continuing to payment...</p>
      </div>
    );
  }

  if (stage.kind === "failed") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">Verification unsuccessful</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">{stage.reason}</p>
        <Button className="mt-6" onClick={retry}>
          Try Again
        </Button>
      </div>
    );
  }

  // stage.kind === "error" - configuration/network problem talking to Jumio.
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-serif text-xl text-charcoal">Couldn&apos;t start verification</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{stage.message}</p>
      <Button className="mt-6" onClick={retry}>
        Try Again
      </Button>
    </div>
  );
}

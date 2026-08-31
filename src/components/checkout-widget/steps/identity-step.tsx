"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/checkoutSession";
import type { JumioStatus } from "@/lib/checkoutSession";
import { useJumioStatusPush } from "@/lib/signalr";

// Backend-proxied Jumio flow for the real checkout - calls this app's own
// /api/checkout/jumio/* routes (which call the same backend
// the reference crypto-widget backend uses), not Jumio directly. This is
// deliberately the fuller the reference backend state machine (see its
// src/components/moonPay/kycChecks/Selfie.tsx), not the simplified demo
// shortcuts in src/components/quick-buy/steps/identity-step.tsx - a real
// AwaitingManualVerification here must NOT auto-continue to payment the way
// the demo's WARNING-as-pass shortcut does.
//
// IMPORTANT: this does NOT poll checkuserinfo/idsubmit on an interval.
// Confirmed against the live UAT backend (see src/lib/signalr.ts) that
// polling checkuserinfo while a submission is "IdFrameSubmitted" just
// echoes the same cached status forever - an earlier version of this file
// did exactly that and produced an infinite request loop. idsubmit fires
// exactly once (triggered by the Jumio iframe's postMessage); everything
// after that resolves via the SignalR push, with a manual "Check again"
// button as the only fallback.

type Stage =
  | { kind: "consent" }
  | { kind: "starting" }
  | { kind: "verifying"; iframeUrl: string; submitting?: boolean }
  | { kind: "submitted" }
  | { kind: "checkingInfo" }
  | { kind: "infoNotVerified"; attempts: number }
  | { kind: "manualPending" }
  | { kind: "cooldown" }
  | { kind: "passed" }
  | { kind: "rejected" }
  | { kind: "error"; message: string; detail?: string };

const MAX_INFO_RETRY_ATTEMPTS = 1;

// Jumio's hosted KYX Web SDK posts a completion message from an iframe whose
// origin looks like https://<merchant>.web.<region>.jumio.ai (or the legacy
// netverify.com) - same allowlist the demo identity-step and
// deposit-onboarding's JumioIframe.tsx use.
function isJumioOrigin(origin: string): boolean {
  return /^https:\/\/([a-z0-9-]+\.)?(web\.[a-z0-9-]+\.jumio\.ai|netverify\.com)$/i.test(origin);
}

async function callJumioRoute(
  path: string,
  quickBuyKey: string | undefined,
  body: Record<string, unknown> = {}
): Promise<
  | { ok: true; status: string | null; additionalData: JumioStatus["additionalData"] }
  | { ok: false; error: string; detail?: string }
> {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, error: "Your session expired. Please verify your email again." };
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, quickBuyKey, ...body }),
    });
    const data = await res.json();
    if (!data.ok) {
      return {
        ok: false,
        error: data.error ?? "Something went wrong verifying your identity.",
        detail: data.detail ?? `${path} responded ${res.status}${data.error ? "" : " with no error detail"}`,
      };
    }
    return { ok: true, status: data.status, additionalData: data.additionalData };
  } catch (err) {
    return {
      ok: false,
      error: "Couldn't reach the verification service. Please try again.",
      detail: err instanceof Error ? `${path}: ${err.message}` : `${path}: network error`,
    };
  }
}

export function IdentityStep({
  initialStatus,
  quickBuyKey,
  onContinue,
}: {
  initialStatus: JumioStatus | null;
  quickBuyKey?: string;
  onContinue: () => void;
}) {
  const [stage, setStage] = useState<Stage>(() => stageFromStatus(initialStatus?.status ?? null, initialStatus?.additionalData ?? null));
  const hasRunCheckInfoRef = useRef(false);

  function stageFromStatus(rawStatus: string | null, additionalData: JumioStatus["additionalData"]): Stage {
    if (!rawStatus || rawStatus === "IdCollectConsent") return { kind: "consent" };
    return applyStatusToStage(rawStatus, additionalData);
  }

  // Translates a raw backend status string into this component's UI state.
  // Mirrors the reference backend's Selfie.tsx switch, minus the render - this
  // just decides what to show next, callers apply it via setStage.
  function applyStatusToStage(rawStatus: string, additionalData: JumioStatus["additionalData"]): Stage {
    switch (rawStatus) {
      case "IdCollectConsent":
        return { kind: "consent" };
      case "IdFrame":
        return additionalData?.iframeUrl
          ? { kind: "verifying", iframeUrl: additionalData.iframeUrl }
          : { kind: "error", message: "Couldn't start verification. Please try again." };
      case "IdFrameSubmitted":
        return { kind: "submitted" };
      // Jumio's own capture/document check passed - the backend still needs
      // a name-match check (checkUserInfo) before this is really done.
      case "Success":
        return { kind: "checkingInfo" };
      case "IdFrameFailed":
      case "InternalError":
        return { kind: "error", message: "Something went wrong verifying your identity.", detail: rawStatus };
      case "FrameCooldown":
        return { kind: "cooldown" };
      case "InfoNotVerified":
        return { kind: "infoNotVerified", attempts: 0 };
      case "AwaitingManualVerification":
      case "UpdateCurrent":
        return { kind: "manualPending" };
      case "Verified":
        return { kind: "passed" };
      case "Rejected":
        return { kind: "rejected" };
      default:
        // Genuinely unrecognized status - show it rather than hiding it
        // behind a generic message, so a stuck session is diagnosable from
        // the screen itself instead of needing DevTools.
        return {
          kind: "error",
          message: "Something went wrong verifying your identity.",
          detail: `Unrecognized status: "${rawStatus}"`,
        };
    }
  }

  function applyResult(result: Awaited<ReturnType<typeof callJumioRoute>>) {
    if (!result.ok) {
      setStage({ kind: "error", message: result.error, detail: result.detail });
      return;
    }
    if (!result.status) {
      setStage({
        kind: "error",
        message: "Something went wrong verifying your identity.",
        detail: "Response had ok:true but no status field",
      });
      return;
    }
    setStage(applyStatusToStage(result.status, result.additionalData));
  }

  useEffect(() => {
    if (stage.kind === "passed") {
      const timer = setTimeout(onContinue, 1100);
      return () => clearTimeout(timer);
    }
  }, [stage, onContinue]);

  // The only automatic follow-up call in this whole flow: once Jumio's
  // capture succeeds, do the name-match check exactly once. Everything else
  // (IdFrameSubmitted resolving) comes from the SignalR push below or a
  // manual "Check again" click - never an automatic retry loop.
  useEffect(() => {
    if (stage.kind === "checkingInfo" && !hasRunCheckInfoRef.current) {
      hasRunCheckInfoRef.current = true;
      checkUserInfo();
    }
    if (stage.kind !== "checkingInfo") {
      hasRunCheckInfoRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function handleStartVerification() {
    setStage({ kind: "starting" });
    const result = await callJumioRoute("/api/checkout/jumio/consent", quickBuyKey);
    applyResult(result);
  }

  // Fires exactly once, when Jumio's hosted iframe posts its completion
  // message - never on an interval.
  async function idSubmit() {
    setStage((s) => (s.kind === "verifying" ? { ...s, submitting: true } : s));
    const result = await callJumioRoute("/api/checkout/jumio/idsubmit", quickBuyKey);
    applyResult(result);
  }

  async function checkUserInfo(firstName?: string, lastName?: string) {
    const result = await callJumioRoute("/api/checkout/jumio/checkuserinfo", quickBuyKey, {
      customerFirstName: firstName ?? "",
      customerLastName: lastName ?? "",
    });
    applyResult(result);
  }

  useEffect(() => {
    if (stage.kind !== "verifying") return;
    function handleMessage(event: MessageEvent) {
      if (!isJumioOrigin(event.origin)) return;
      idSubmit();
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.kind]);

  // Live push from the backend - the only way "IdFrameSubmitted" actually
  // resolves. Active for the lifetime of this step once we have a session.
  useJumioStatusPush(getAccessToken(), (status, additionalData) => {
    setStage(applyStatusToStage(status, additionalData));
  });

  const [checkingAgain, setCheckingAgain] = useState(false);
  async function handleCheckAgain() {
    setCheckingAgain(true);
    await checkUserInfo();
    setCheckingAgain(false);
  }

  async function retry() {
    setStage({ kind: "starting" });
    const result = await callJumioRoute("/api/checkout/jumio/retry", quickBuyKey);
    applyResult(result);
  }

  async function requestManualHelp() {
    const result = await callJumioRoute("/api/checkout/jumio/request-manual", quickBuyKey);
    applyResult(result);
  }

  if (stage.kind === "consent" || stage.kind === "starting") {
    return (
      <div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-beige text-sage-dark">
            <IdCard className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl text-charcoal">Verify your identity</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
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
    if (!stage.submitting) {
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

    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">Finishing up...</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Confirming your submission - just a moment.
        </p>
      </div>
    );
  }

  if (stage.kind === "submitted" || stage.kind === "checkingInfo") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">Checking your details...</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          We&apos;re confirming your submission - this usually takes under a minute. No need to
          do anything else here.
        </p>
        {stage.kind === "submitted" && (
          <Button
            className="mt-6"
            size="sm"
            variant="ghost"
            onClick={handleCheckAgain}
            disabled={checkingAgain}
          >
            {checkingAgain ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking...
              </span>
            ) : (
              "Check now"
            )}
          </Button>
        )}
      </div>
    );
  }

  if (stage.kind === "infoNotVerified") {
    return (
      <IdentityNameRecheck
        onSubmit={async (firstName, lastName) => {
          if (stage.attempts >= MAX_INFO_RETRY_ATTEMPTS) {
            setStage({ kind: "rejected" });
            return;
          }
          setStage({ kind: "infoNotVerified", attempts: stage.attempts + 1 });
          await checkUserInfo(firstName, lastName);
        }}
      />
    );
  }

  if (stage.kind === "manualPending") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/40 text-charcoal">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">Verification in review</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Your submission has been passed to our team for manual review. We&apos;ll email you once
          it&apos;s complete - this checkout can&apos;t continue until then.
        </p>
      </div>
    );
  }

  if (stage.kind === "cooldown") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">Verification session expired</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          You&apos;ve reached the limit of verification attempts for now.
        </p>
        <Button className="mt-6" onClick={requestManualHelp}>
          Request manual review
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

  if (stage.kind === "rejected") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-serif text-xl text-charcoal">We couldn&apos;t verify your identity</h2>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Please contact support to complete this order.
        </p>
      </div>
    );
  }

  // stage.kind === "error"
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-serif text-xl text-charcoal">Couldn&apos;t verify your identity</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{stage.message}</p>
      {stage.detail && (
        <p className="mt-2 max-w-sm break-words rounded-lg bg-beige/60 px-3 py-1.5 font-mono text-[11px] text-stone-500">
          {stage.detail}
        </p>
      )}
      <Button className="mt-6" onClick={retry}>
        Try Again
      </Button>
    </div>
  );
}

function IdentityNameRecheck({ onSubmit }: { onSubmit: (firstName: string, lastName: string) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <div>
      <h2 className="text-center font-serif text-xl text-charcoal">Confirm your name</h2>
      <p className="mt-2 text-center text-sm text-stone-500">
        The name on your ID didn&apos;t match. Please confirm it exactly as it appears on your ID.
      </p>
      <div className="mt-5 space-y-4">
        <FormField label="First name" htmlFor="id-first-name">
          <Input id="id-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </FormField>
        <FormField label="Last name" htmlFor="id-last-name">
          <Input id="id-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </FormField>
      </div>
      <Button
        className="mt-5 w-full"
        size="lg"
        onClick={() => onSubmit(firstName.trim(), lastName.trim())}
        disabled={!firstName.trim() || !lastName.trim()}
      >
        Continue
      </Button>
    </div>
  );
}

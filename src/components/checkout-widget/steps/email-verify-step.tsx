"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "./otp-input";
import { BackButton } from "../back-button";
import { isValidEmail } from "@/lib/validation";
import { maskEmail } from "@/lib/utils";
import { getOrCreateClientSignature, saveCheckoutSession, type JumioStatus } from "@/lib/checkoutSession";

type Phase = "email" | "sending" | "otp" | "verifying";

const RESEND_COOLDOWN_SECONDS = 30;

// Mirrors the reference backend's SignInWithEmail.tsx flow: submit email ->
// backend either returns an accessToken directly (already verified/known,
// skip the code screen) or signals a code was sent -> enter code -> sign-in.
// onVerified hands control back to the parent shell with whether this
// customer is already fully KYC-verified and, if not, the Jumio stage the
// backend seeded (same jumioVerificationStatusObj the reference backend gets
// back from these same calls) so the identity step can resume from there
// instead of always restarting at the consent screen.
export function EmailVerifyStep({
  quickBuyKey,
  onVerified,
}: {
  quickBuyKey?: string;
  onVerified: (verified: boolean, jumioStatus: JumioStatus | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("email");
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [termsHtml, setTermsHtml] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function sendCode(): Promise<"sent" | "verified" | "error"> {
    const clientSignature = getOrCreateClientSignature();
    const res = await fetch("/api/checkout/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, clientSignature, quickBuyKey }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Couldn't verify that email address.");
      setErrorDetail(data.detail ?? null);
      return "error";
    }
    if (data.alreadyVerified) {
      saveCheckoutSession({ accessToken: data.accessToken, encryption: data.encryption ?? undefined });
      onVerified(Boolean(data.verified), data.jumioStatus ?? null);
      return "verified";
    }
    setTermsHtml(data.termsHtml ?? null);
    return "sent";
  }

  async function submitEmail(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setErrorDetail(null);
    setPhase("sending");
    try {
      const result = await sendCode();
      if (result === "error") {
        setPhase("email");
        return;
      }
      if (result === "sent") {
        setPhase("otp");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
      // result === "verified": onVerified() already handed control back to
      // the parent shell, which is about to unmount this step - nothing
      // further to do here.
    } catch {
      setError("Couldn't reach the verification service. Please try again.");
      setPhase("email");
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await sendCode();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Couldn't resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function submitCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the terms to continue.");
      return;
    }
    setError(null);
    setErrorDetail(null);
    setPhase("verifying");
    try {
      const clientSignature = getOrCreateClientSignature();
      const res = await fetch("/api/checkout/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          verificationCode: code.trim(),
          clientSignature,
          acceptedTerms,
          quickBuyKey,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Couldn't sign you in.");
        setErrorDetail(data.detail ?? null);
        setPhase("otp");
        return;
      }
      saveCheckoutSession({ accessToken: data.accessToken, encryption: data.encryption ?? undefined });
      onVerified(Boolean(data.verified), data.jumioStatus ?? null);
    } catch {
      setError("Couldn't reach the verification service. Please try again.");
      setPhase("otp");
    }
  }

  function goBackToEmail() {
    setPhase("email");
    setCode("");
    setError(null);
  }

  if (phase === "otp" || phase === "verifying") {
    return (
      <form onSubmit={submitCode}>
        {phase === "otp" && <BackButton onClick={goBackToEmail} />}
        <h2 className="text-center font-serif text-2xl text-charcoal">Check your email</h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Enter the 6-digit code sent to <span className="text-stone-700">{maskEmail(email)}</span>
        </p>

        <div className="mt-6">
          <OtpInput value={code} onChange={setCode} />
        </div>

        <div className="mt-3 text-center text-xs text-stone-400">
          {resendCooldown > 0 ? (
            <span>Resend code in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-sage-dark underline underline-offset-4 disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend code"}
            </button>
          )}
        </div>

        <label className="mt-5 flex items-start gap-3">
          <Checkbox
            className="mt-0.5"
            checked={acceptedTerms}
            onCheckedChange={(v) => setAcceptedTerms(!!v)}
          />
          <span
            className="text-sm leading-relaxed text-stone-600 [&_a]:text-sage-dark [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: termsHtml ?? "I agree to the Terms &amp; Conditions and Privacy Policy." }}
          />
        </label>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {errorDetail && (
          <p className="mt-1.5 max-w-sm break-words rounded-lg bg-beige/60 px-3 py-1.5 font-mono text-[11px] text-stone-500">
            {errorDetail}
          </p>
        )}

        <Button
          type="submit"
          className="mt-5 w-full"
          size="lg"
          disabled={phase === "verifying" || !acceptedTerms || code.trim().length < 6}
        >
          {phase === "verifying" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
            </span>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitEmail}>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-beige text-sage-dark">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Verify your email</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Enter your email to continue to checkout.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <FormField label="Email address" htmlFor="cw-email" error={error ?? undefined}>
          <Input
            id="cw-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="off"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
        </FormField>
        {errorDetail && (
          <p className="mt-1.5 max-w-sm break-words rounded-lg bg-beige/60 px-3 py-1.5 font-mono text-[11px] text-stone-500">
            {errorDetail}
          </p>
        )}
      </div>
      <Button type="submit" className="mt-5 w-full" size="lg" disabled={phase === "sending"}>
        {phase === "sending" ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
          </span>
        ) : (
          "Continue"
        )}
      </Button>
      <p className="mt-4 text-center text-xs text-stone-400">
        We&apos;ll only use this to verify your order.
      </p>
    </form>
  );
}

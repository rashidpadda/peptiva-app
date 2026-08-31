"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

// Six separate boxes instead of one text field - standard OTP UX (auto-
// advances on entry, supports backspace-to-previous and pasting the full
// code at once).
export function OtpInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const nextFocusIndex = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  }

  return (
    <div>
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            autoComplete="off"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              "h-14 w-full rounded-lg border bg-white text-center text-lg font-medium text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800",
              error ? "border-red-400" : "border-stone-300"
            )}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={!!error}
          />
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

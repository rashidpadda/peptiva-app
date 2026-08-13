"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-sage/10 py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Join Us</p>
        <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
          Get 10% off your first order.
        </h2>
        <p className="mt-3 text-sm text-stone-600">
          Sign up for skincare tips, early access and peptide routine guides.
        </p>
        <form
          className="mx-auto mt-6 flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            toast.success("Welcome to PEPTIVA", {
              description: "Your 10% off code is on its way to your inbox.",
            });
            setEmail("");
          }}
        >
          <Input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
          />
          <Button type="submit" size="md" className="shrink-0">
            Sign Up
          </Button>
        </form>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { CustomerInfo } from "@/lib/types";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function InformationStep({
  initialValue,
  onContinue,
}: {
  initialValue: CustomerInfo;
  onContinue: (value: CustomerInfo) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!value.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!value.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!value.email.trim()) nextErrors.email = "Email is required";
    else if (!isValidEmail(value.email)) nextErrors.email = "Enter a valid email address";
    if (!value.phone.trim()) nextErrors.phone = "Phone number is required";
    else if (!isValidPhone(value.phone)) nextErrors.phone = "Enter a valid phone number";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onContinue(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
          <Input
            id="firstName"
            value={value.firstName}
            onChange={(e) => setValue((v) => ({ ...v, firstName: e.target.value }))}
            error={errors.firstName}
          />
        </FormField>
        <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
          <Input
            id="lastName"
            value={value.lastName}
            onChange={(e) => setValue((v) => ({ ...v, lastName: e.target.value }))}
            error={errors.lastName}
          />
        </FormField>
      </div>
      <FormField label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          type="email"
          value={value.email}
          onChange={(e) => setValue((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
        />
      </FormField>
      <FormField label="Phone" htmlFor="phone" error={errors.phone}>
        <Input
          id="phone"
          type="tel"
          value={value.phone}
          onChange={(e) => setValue((v) => ({ ...v, phone: e.target.value }))}
          error={errors.phone}
        />
      </FormField>

      <label className="flex items-center gap-3">
        <Checkbox
          checked={value.subscribe}
          onCheckedChange={(v) => setValue((prev) => ({ ...prev, subscribe: !!v }))}
        />
        <span className="text-sm text-stone-600">
          Subscribe to skincare tips and product updates
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Continue to Shipping
      </Button>
    </form>
  );
}

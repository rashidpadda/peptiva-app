"use client";

import { useState } from "react";
import type { Address, ShippingMethod } from "@/lib/types";
import { isValidZip } from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, EXPRESS_SHIPPING_COST } from "@/store/cart";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia"];

export function ShippingStep({
  initialAddress,
  initialMethod,
  subtotal,
  onBack,
  onContinue,
}: {
  initialAddress: Address;
  initialMethod: ShippingMethod;
  subtotal: number;
  onBack: () => void;
  onContinue: (address: Address, method: ShippingMethod) => void;
}) {
  const [value, setValue] = useState(initialAddress);
  const [method, setMethod] = useState<ShippingMethod>(initialMethod);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const qualifiesFreeStandard = subtotal >= FREE_SHIPPING_THRESHOLD;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof Address, string>> = {};
    if (!value.firstName.trim()) nextErrors.firstName = "Required";
    if (!value.lastName.trim()) nextErrors.lastName = "Required";
    if (!value.address1.trim()) nextErrors.address1 = "Address is required";
    if (!value.city.trim()) nextErrors.city = "City is required";
    if (!value.state.trim()) nextErrors.state = "State is required";
    if (!value.zip.trim()) nextErrors.zip = "ZIP code is required";
    else if (!isValidZip(value.zip)) nextErrors.zip = "Enter a valid postal code";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onContinue(value, method);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="s-firstName" error={errors.firstName}>
          <Input
            id="s-firstName"
            value={value.firstName}
            onChange={(e) => setValue((v) => ({ ...v, firstName: e.target.value }))}
            error={errors.firstName}
          />
        </FormField>
        <FormField label="Last Name" htmlFor="s-lastName" error={errors.lastName}>
          <Input
            id="s-lastName"
            value={value.lastName}
            onChange={(e) => setValue((v) => ({ ...v, lastName: e.target.value }))}
            error={errors.lastName}
          />
        </FormField>
      </div>

      <FormField label="Address" htmlFor="address1" error={errors.address1}>
        <Input
          id="address1"
          value={value.address1}
          onChange={(e) => setValue((v) => ({ ...v, address1: e.target.value }))}
          error={errors.address1}
        />
      </FormField>

      <FormField label="Apartment / Suite (optional)" htmlFor="address2">
        <Input
          id="address2"
          value={value.address2 ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, address2: e.target.value }))}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="City" htmlFor="city" error={errors.city}>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => setValue((v) => ({ ...v, city: e.target.value }))}
            error={errors.city}
          />
        </FormField>
        <FormField label="State / Province" htmlFor="state" error={errors.state}>
          <Input
            id="state"
            value={value.state}
            onChange={(e) => setValue((v) => ({ ...v, state: e.target.value }))}
            error={errors.state}
          />
        </FormField>
        <FormField label="ZIP / Postal Code" htmlFor="zip" error={errors.zip}>
          <Input
            id="zip"
            value={value.zip}
            onChange={(e) => setValue((v) => ({ ...v, zip: e.target.value }))}
            error={errors.zip}
          />
        </FormField>
      </div>

      <FormField label="Country" htmlFor="country">
        <Select
          id="country"
          value={value.country}
          onChange={(e) => setValue((v) => ({ ...v, country: e.target.value }))}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </FormField>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Shipping Method
        </p>
        <RadioGroup
          value={method}
          onValueChange={(v) => setMethod(v as ShippingMethod)}
          className="mt-3"
        >
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-300 p-4 has-[[data-state=checked]]:border-charcoal">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="standard" />
              <div>
                <p className="text-sm font-medium text-charcoal">Standard Shipping</p>
                <p className="text-xs text-stone-500">5-7 business days</p>
              </div>
            </div>
            <span className="text-sm text-charcoal">
              {qualifiesFreeStandard ? "Free" : "$6.95"}
            </span>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-300 p-4 has-[[data-state=checked]]:border-charcoal">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="express" />
              <div>
                <p className="text-sm font-medium text-charcoal">Express Shipping</p>
                <p className="text-xs text-stone-500">2-3 business days</p>
              </div>
            </div>
            <span className="text-sm text-charcoal">{formatCurrency(EXPRESS_SHIPPING_COST)}</span>
          </label>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}

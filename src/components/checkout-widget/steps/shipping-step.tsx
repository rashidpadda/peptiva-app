"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import type { Address } from "@/lib/types";
import { isValidPhone, isValidZip } from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Same list deposit-onboarding uses for its address country dropdowns
// (page.tsx COUNTRIES) - not tied to any backend, so it copies over as-is.
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia",
  "Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia",
  "Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
  "Kiribati","Korea, North","Korea, South","Kosovo","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan",
  "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia",
  "Zimbabwe",
];

type FieldErrors = Partial<Record<keyof Address, string>> & { phone?: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
      {children}
    </p>
  );
}

export function ShippingStep({
  initialAddress,
  initialPhone,
  nextLabel = "Continue",
  onContinue,
}: {
  initialAddress: Address;
  initialPhone: string;
  nextLabel?: string;
  onContinue: (address: Address, phone: string) => void;
}) {
  const [value, setValue] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleContinue(e?: React.FormEvent) {
    e?.preventDefault();
    const next: FieldErrors = {};
    if (!value.firstName.trim()) next.firstName = "Required";
    if (!value.lastName.trim()) next.lastName = "Required";
    if (!value.address1.trim()) next.address1 = "Address is required";
    if (!value.city.trim()) next.city = "Required";
    if (!value.state.trim()) next.state = "Required";
    if (!value.zip.trim()) next.zip = "Required";
    else if (!isValidZip(value.zip)) next.zip = "Enter a valid postal code";
    if (!phone.trim()) next.phone = "Phone number is required";
    else if (!isValidPhone(phone)) next.phone = "Enter a valid phone number";

    setErrors(next);
    if (Object.keys(next).length === 0) onContinue(value, phone);
  }

  return (
    <form onSubmit={handleContinue}>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-beige text-sage-dark">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Shipping details</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Where should we send your order?
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <SectionLabel>Contact</SectionLabel>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" htmlFor="cw-first" error={errors.firstName}>
                <Input
                  id="cw-first"
                  autoFocus
                  value={value.firstName}
                  onChange={(e) => setValue((v) => ({ ...v, firstName: e.target.value }))}
                  error={errors.firstName}
                />
              </FormField>
              <FormField label="Last Name" htmlFor="cw-last" error={errors.lastName}>
                <Input
                  id="cw-last"
                  value={value.lastName}
                  onChange={(e) => setValue((v) => ({ ...v, lastName: e.target.value }))}
                  error={errors.lastName}
                />
              </FormField>
            </div>

            <FormField label="Phone Number" htmlFor="cw-phone" error={errors.phone}>
              <Input
                id="cw-phone"
                type="tel"
                placeholder="For delivery updates"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
            </FormField>
          </div>
        </div>

        <div>
          <SectionLabel>Delivery address</SectionLabel>
          <div className="space-y-4">
            <FormField label="Address" htmlFor="cw-address1" error={errors.address1}>
              <Input
                id="cw-address1"
                value={value.address1}
                onChange={(e) => setValue((v) => ({ ...v, address1: e.target.value }))}
                error={errors.address1}
              />
            </FormField>

            <FormField label="Apartment / Suite (optional)" htmlFor="cw-address2">
              <Input
                id="cw-address2"
                value={value.address2 ?? ""}
                onChange={(e) => setValue((v) => ({ ...v, address2: e.target.value }))}
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="City" htmlFor="cw-city" error={errors.city}>
                <Input
                  id="cw-city"
                  value={value.city}
                  onChange={(e) => setValue((v) => ({ ...v, city: e.target.value }))}
                  error={errors.city}
                />
              </FormField>
              <FormField label="State" htmlFor="cw-state" error={errors.state}>
                <Input
                  id="cw-state"
                  value={value.state}
                  onChange={(e) => setValue((v) => ({ ...v, state: e.target.value }))}
                  error={errors.state}
                />
              </FormField>
              <FormField label="ZIP" htmlFor="cw-zip" error={errors.zip}>
                <Input
                  id="cw-zip"
                  value={value.zip}
                  onChange={(e) => setValue((v) => ({ ...v, zip: e.target.value }))}
                  error={errors.zip}
                />
              </FormField>
            </div>

            <FormField label="Country" htmlFor="cw-country">
              <Select
                id="cw-country"
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
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full" size="lg">
        {nextLabel}
      </Button>
    </form>
  );
}

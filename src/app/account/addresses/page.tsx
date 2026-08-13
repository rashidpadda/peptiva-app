"use client";

import { useState } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAddressesStore } from "@/store/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EMPTY_FORM = {
  label: "",
  firstName: "",
  lastName: "",
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export default function AccountAddressesPage() {
  const addresses = useAddressesStore((s) => s.addresses);
  const addAddress = useAddressesStore((s) => s.addAddress);
  const removeAddress = useAddressesStore((s) => s.removeAddress);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address1 || !form.city || !form.zip) return;
    addAddress(form);
    toast.success("Address saved");
    setForm(EMPTY_FORM);
    setOpen(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">Manage the addresses on your account.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>New Address</DialogTitle>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <FormField label="Label" htmlFor="label">
                <Input
                  id="label"
                  placeholder="Home, Office..."
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" htmlFor="a-firstName">
                  <Input
                    id="a-firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </FormField>
                <FormField label="Last Name" htmlFor="a-lastName">
                  <Input
                    id="a-lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </FormField>
              </div>
              <FormField label="Address" htmlFor="a-address1">
                <Input
                  id="a-address1"
                  required
                  value={form.address1}
                  onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))}
                />
              </FormField>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="City" htmlFor="a-city">
                  <Input
                    id="a-city"
                    required
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </FormField>
                <FormField label="State" htmlFor="a-state">
                  <Input
                    id="a-state"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  />
                </FormField>
                <FormField label="ZIP" htmlFor="a-zip">
                  <Input
                    id="a-zip"
                    required
                    value={form.zip}
                    onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                  />
                </FormField>
              </div>
              <Button type="submit" className="w-full">
                Save Address
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="h-8 w-8 text-stone-400" />
          <p className="text-sm text-stone-500">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border-soft p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {address.label || "Address"}
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-beige px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-600">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-stone-600">{address.address1}</p>
                  <p className="text-sm text-stone-600">
                    {address.city}, {address.state} {address.zip}
                  </p>
                </div>
                <button
                  onClick={() => {
                    removeAddress(address.id);
                    toast("Address removed");
                  }}
                  aria-label="Remove address"
                  className="text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

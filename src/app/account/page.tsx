import { demoCustomer } from "@/data/customer";
import { formatDate } from "@/lib/utils";

export default function AccountProfilePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-2xl border border-border-soft bg-cream p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Personal Information
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-stone-500">First Name</p>
            <p className="mt-1 text-sm text-charcoal">{demoCustomer.firstName}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Last Name</p>
            <p className="mt-1 text-sm text-charcoal">{demoCustomer.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Email</p>
            <p className="mt-1 text-sm text-charcoal">{demoCustomer.email}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Phone</p>
            <p className="mt-1 text-sm text-charcoal">{demoCustomer.phone}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Member Since
        </p>
        <p className="mt-1 text-sm text-charcoal">{formatDate(demoCustomer.memberSince)}</p>
      </div>
    </div>
  );
}

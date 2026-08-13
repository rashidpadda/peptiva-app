import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">My Account</p>
      <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Welcome back</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

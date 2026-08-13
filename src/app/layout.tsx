import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "PEPTIVA — Advanced Peptides. Visible Confidence.",
    template: "%s | PEPTIVA",
  },
  description:
    "Peptide-focused skincare formulated to support the appearance of firmer, smoother, healthier-looking skin and a strong skin barrier.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--color-charcoal)",
              color: "var(--color-ivory)",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              padding: "0.75rem 1.25rem",
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
  title: "PEPTIVA",
  description: "Premium peptide skincare.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <main className="flex-1">{children}</main>
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

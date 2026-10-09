import type { Metadata, Viewport } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Budget Tracker",
    template: "%s · Budget Tracker",
  },
  description: "Track your income and expenses in Philippine pesos.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a19" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PH">
      <body>
        <NavBar />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}

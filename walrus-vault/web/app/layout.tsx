import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";
import { AuroraBackground } from "@/components/AuroraBackground";

export const metadata: Metadata = {
  title: "Walrus Vault — Letters to the future, sealed on Sui",
  description:
    "Encrypt a file once, lock it behind a date. Walrus stores it, Sui guards it. Programmable digital inheritance & time capsules.",
  openGraph: {
    title: "Walrus Vault",
    description:
      "Programmable digital inheritance & time capsules on Sui. Built for the Tatum × Walrus Hackathon.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">
        <AuroraBackground />
        <div className="grain" />
        <Providers>
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { Navbar } from "@/components/Navbar";
import { WalletButton } from "@/components/WalletButton";

export const metadata: Metadata = {
  title: "FHE 2048 - Privacy-Preserving Blockchain Game",
  description: "Play 2048 with encrypted scores on blockchain using FHEVM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>
          <Navbar walletButton={<WalletButton />} />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import BottomNav from "../components/layout/BottomNav";

export const metadata: Metadata = {
  title: "VoxSilent | Secure Anonymous Meeting",
  description: "Suarakan Ide Tanpa Tekanan, Ambil Keputusan dengan Pasti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <StoreProvider>
          <div className="mobile-app-shell">
            <div className="grid-background"></div>
            {children}
            <BottomNav />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}

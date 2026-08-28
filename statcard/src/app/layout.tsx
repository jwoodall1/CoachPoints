import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { PresenceProvider } from "@/components/PresenceProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

// These defaults describe every page unless a route supplies more specific metadata.
export const metadata: Metadata = {
  title: "Rosterra | Performance Meets Opportunity",
  description: "Professional athlete profiles, recruiting tools, and direct connections for athletes and coaches.",
};

/** Supplies the shared navigation, authentication state, and footer around every route. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PresenceProvider>
            <SiteNav />
            {children}
            <SiteFooter />
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

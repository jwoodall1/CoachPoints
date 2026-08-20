import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import SiteNav from "@/components/SiteNav";

// These defaults describe every page unless a route supplies more specific metadata.
export const metadata: Metadata = {
  title: "Athlio | Athlete Profiles",
  description: "Dynamic performance tracking and digital profiles for athletes.",
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
          <SiteNav />
          {children}
          <footer className="py-6 text-center text-sm text-gray-400">
            Powered by Athlio
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

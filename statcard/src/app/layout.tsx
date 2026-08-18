import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

// This metadata improves SEO and tab titles
export const metadata: Metadata = {
  title: "Athlio | Athlete Profiles",
  description: "Dynamic performance tracking and digital profiles for athletes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        {/* A subtle global footer */}
        <footer className="text-center py-6 text-sm text-gray-400">
          Powered by Athlio
        </footer>
      </body>
    </html>
  );
}

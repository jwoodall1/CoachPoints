import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

// This optimizes and loads the Inter font
const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
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

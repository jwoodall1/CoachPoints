import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// This optimizes and loads the Inter font
const inter = Inter({ subsets: ["latin"] });

// This metadata improves SEO and tab titles
export const metadata: Metadata = {
  title: "StatCard | Athlete Profiles",
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
        {/* If you wanted a global Nav bar, you would put it here before children */}
        {children}
        {/* A subtle global footer */}
        <footer className="text-center py-6 text-sm text-gray-400">
          Powered by StatCard
        </footer>
      </body>
    </html>
  );
}
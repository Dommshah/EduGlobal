import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Eduglobal — Your Gateway to Global Education",
    template: "%s · Eduglobal",
  },
  description:
    "Eduglobal is a premium international education consultancy connecting students to 850+ partner universities across 28 countries — admissions, visas, scholarships and beyond.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

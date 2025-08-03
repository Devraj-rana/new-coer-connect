import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/MainLayout";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/lib/firebase/auth";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COER Connect",
  description: "A social platform for COER community to connect and collaborate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <AuthProvider>
        <html lang="en">
          <body className={`${inter.className} min-h-screen bg-gray-50`}>
            <Navbar />
            <MainLayout>
              <main className="w-full">
                {children}
              </main>
            </MainLayout>
            <Toaster position="top-right" richColors />
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  );
}

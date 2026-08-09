import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/lib/providers";
import { AuthProvider } from "@/provider/AuthProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { RedirectComponent } from "./redirect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sagor Enterprise Admin",
  description: "Admin panel for Sagor Enterprise management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          <AuthProvider>
            <RedirectComponent>{children}</RedirectComponent>
          </AuthProvider>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

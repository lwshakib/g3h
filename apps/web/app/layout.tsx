import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@repo/ui/theme-provider";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { AuthHandler } from "@/components/AuthHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Axonix - Modern Monorepo Stack",
  description: "The ultimate turborepo template with Next.js, Shadcn, and Express.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthHandler />
          {children}
          <Toaster position="top-right" closeButton richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}

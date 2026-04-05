import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@repo/ui/theme-provider";
import { Toaster } from "@repo/ui/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
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
      <body className={`${inter.variable} ${orbitron.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" closeButton richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}

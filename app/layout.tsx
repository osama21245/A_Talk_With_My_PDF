import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Providers from "@/components/provider";
import { Toaster } from "react-hot-toast";
import "@fontsource/geist/400.css";
import "@fontsource/geist/700.css";

export const metadata: Metadata = {
  title: "A Talk with My PDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
      <html lang="en">
        <body className="font-geist antialiased"> 
          {children}
          <Toaster />
        </body>
      </html>
      </Providers>
    </ClerkProvider>
  );
}

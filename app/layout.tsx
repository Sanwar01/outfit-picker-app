import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { colors } from "@/lib/design/tokens";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-auth-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-auth-serif",
  subsets: ["latin"],
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: colors.page,
};

export const metadata: Metadata = {
  title: "Outfit Picker",
  description: "AI-powered digital wardrobe and personal stylist",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wardrobe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

import { DM_Sans, Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-auth-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-auth-sans",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${dmSans.variable} min-h-dvh bg-[#f4efe6] font-(family-name:--font-auth-sans) text-[#1a1a1a] antialiased`}
    >
      {children}
    </div>
  );
}

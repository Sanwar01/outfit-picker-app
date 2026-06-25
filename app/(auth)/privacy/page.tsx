import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-6 py-12">
      <Link
        href="/signup"
        className="mb-8 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" strokeWidth={1.5} />
      </Link>
      <h1 className="font-[family-name:var(--font-auth-serif)] text-3xl text-[#1a1a1a]">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6b6560]">
        Privacy policy will be published before launch.
      </p>
    </main>
  );
}

import Link from "next/link";
import { getServerSession } from "@/core/auth/getServerSession";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { IconBolt, IconBook, IconWrench } from "@/components/ui/Icon";
import type { ComponentType, SVGProps } from "react";

const HIGHLIGHTS: {
  title: string;
  body: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "Learn in bite-sized modules",
    body: "Short lessons, hands-on activities, and quizzes -- no walls of text.",
    icon: IconBook,
  },
  {
    title: "Practice hands-on",
    body: "Identify real components and work through interactive activities as you go.",
    icon: IconWrench,
  },
  {
    title: "Earn XP and level up",
    body: "Unlock modules one at a time as you build real technician skills.",
    icon: IconBolt,
  },
];

export default async function LandingPage() {
  const user = await getServerSession();
  if (user) redirect("/lobby");

  return (
    <main className="flex-1">
      <section className="px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase mb-6">
          <Logomark className="h-7 w-7" />
          ByteForge
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text">
          Learn Computer Systems Servicing,{" "}
          <span className="relative whitespace-nowrap">
            one build at a time.
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              className="absolute -bottom-1 left-0 w-full text-primary/70"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8.5C60 3 150 2 298 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
        <p className="mt-5 text-lg text-text-muted">
          A gamified training ground for CSS NC II fundamentals -- hardware,
          assembly, cabling, troubleshooting, and more. Build real skills through
          interactive practice, not just reading.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Start Learning</Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-text-faint max-w-lg mx-auto">
          ByteForge is an independent educational preparation tool built around the
          TESDA Computer Systems Servicing NC II competency framework. It is not an
          official TESDA assessment and does not issue TESDA National Certificates
          -- completing it awards a ByteForge Certificate of Completion.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <Card key={h.title} className="p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
              <h.icon className="h-5 w-5" />
            </div>
            <h2 className="font-display font-semibold text-text mb-1">{h.title}</h2>
            <p className="text-sm text-text-muted">{h.body}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}

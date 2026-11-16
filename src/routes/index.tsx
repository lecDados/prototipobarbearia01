import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Black Studio — Gestão da barbearia" },
      { name: "description", content: "Painel de gestão da Black Studio para agenda, serviços, equipe e finanças." },
      { property: "og:title", content: "Black Studio — Gestão da barbearia" },
      { property: "og:description", content: "Agenda, equipe, serviços e finanças em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell showChat={false}>
      <section className="animate-float-in relative -mx-4 -mb-12 flex min-h-[calc(100svh-4rem)] w-auto flex-col items-center px-4 text-center sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-gradient-brand text-5xl font-semibold leading-[1.02] sm:text-7xl lg:text-8xl">
            Hello,<br />Vanio Black!
          </h1>
        </div>
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <Link
            to="/dashboard"
            className="bg-gradient-brand liquid-button inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] active:scale-[0.97]"
          >
            Iniciar
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

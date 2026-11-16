import { ArrowUpRight, Boxes, CircleDollarSign, ListOrdered } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

function NewsFlowLines() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 600 300"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="news-flow-a" x1="0" y1="0" x2="600" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.19 350)" />
          <stop offset="0.5" stopColor="oklch(0.6 0.2 300)" />
          <stop offset="1" stopColor="oklch(0.62 0.17 250)" />
        </linearGradient>
        <linearGradient id="news-flow-b" x1="0" y1="300" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.65 0.18 265)" />
          <stop offset="0.5" stopColor="oklch(0.68 0.2 320)" />
          <stop offset="1" stopColor="oklch(0.75 0.15 200)" />
        </linearGradient>
      </defs>
      <g opacity="0.5">
        <path d="M -10 12 C 120 60, 200 -20, 320 40 S 520 120, 620 70" stroke="url(#news-flow-a)" strokeWidth="1" />
        <path d="M -10 22 C 140 90, 240 10, 360 70 S 540 150, 620 100" stroke="url(#news-flow-b)" strokeWidth="3" strokeLinecap="round" />
        <path d="M -10 34 C 110 110, 260 30, 380 100 S 550 180, 620 130" stroke="url(#news-flow-a)" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
        <path d="M -10 6 C 160 40, 220 -30, 340 20 S 500 90, 620 40" stroke="url(#news-flow-b)" strokeWidth="1.5" />
        <path d="M -10 280 C 140 220, 260 320, 400 250 S 560 170, 620 220" stroke="url(#news-flow-a)" strokeWidth="1" />
        <path d="M -10 292 C 120 240, 280 330, 420 265 S 570 190, 620 240" stroke="url(#news-flow-b)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 18 -8; 0 0" dur="14s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

export function BarberNews({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Redes sociais e atalhos"
      className="relative mb-7 overflow-hidden rounded-2xl border border-surface-dark-border bg-surface-dark p-5 text-surface-dark-foreground shadow-soft min-[560px]:p-8"
    >
      <NewsFlowLines />
      <div className="relative z-10 min-w-0">{children}</div>
      <nav aria-label="Atalhos do Dashboard" className="relative z-10 mt-4 flex flex-wrap gap-2 border-t border-surface-dark-border pt-4">
        <Button asChild className="h-10 rounded-full bg-queue-action px-4 text-xs text-queue-action-foreground transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:bg-queue-action-hover active:scale-[0.97] motion-reduce:transform-none">
          <Link to="/fila"><ListOrdered />Fila online<ArrowUpRight className="ml-auto" /></Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-full border-surface-dark-border bg-transparent px-4 text-xs text-surface-dark-foreground transition-transform duration-200 hover:-translate-y-1 hover:bg-surface-dark-hover hover:text-surface-dark-foreground active:scale-[0.97] motion-reduce:transform-none">
          <Link to="/contas"><CircleDollarSign />Contas<ArrowUpRight className="ml-auto" /></Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-full border-surface-dark-border bg-transparent px-4 text-xs text-surface-dark-foreground transition-transform duration-200 hover:-translate-y-1 hover:bg-surface-dark-hover hover:text-surface-dark-foreground active:scale-[0.97] motion-reduce:transform-none">
          <Link to="/estoque"><Boxes />Estoque<ArrowUpRight className="ml-auto" /></Link>
        </Button>
      </nav>
    </section>
  );
}

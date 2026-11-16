import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell, PageHeader, Panel, PrimaryButton, pageHead } from "@/components/AppShell";
import { items } from "@/lib/indicadores";

export const Route = createFileRoute("/estoque")({
  head: () => pageHead("Estoque", "Controle de produtos e insumos da barbearia."),
  component: Estoque,
});

function Estoque() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Produtos" title="Estoque" action={<PrimaryButton><Plus size={16} className="mr-1" />Novo produto</PrimaryButton>} />
        <Panel eyebrow="Inventário" title="Produtos cadastrados" className="mt-8">
          <div className="divide-y divide-border">
            {items.map((it) => {
              const pct = Math.round((it.qty / it.max) * 100);
              const low = pct < 30;
              return (
                <div key={it.name} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 sm:grid-cols-[1.2fr_1.5fr_5rem]">
                  <div>
                    <p className="text-sm font-semibold">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{it.price} / un.</p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${low ? "bg-destructive" : "bg-gradient-brand"}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                  <span className={`text-right text-sm font-semibold ${low ? "text-destructive" : ""}`}>{it.qty} un.</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock3, Plus } from "lucide-react";
import { AppShell, PageHeader, Panel, PrimaryButton, StatGrid, pageHead } from "@/components/AppShell";
import { bills } from "@/lib/indicadores";

export const Route = createFileRoute("/contas")({
  head: () => pageHead("Contas", "Contas a pagar e a receber da barbearia."),
  component: Contas,
});

const statusStyle: Record<string, string> = {
  Pendente: "bg-secondary text-secondary-foreground",
  Vencendo: "bg-chart-1/15 text-chart-1",
  Paga: "bg-success/15 text-success",
};

function Contas() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Financeiro" title="Contas" action={<PrimaryButton><Plus size={16} className="mr-1" />Nova conta</PrimaryButton>} />
        <StatGrid items={[
          { label: "A pagar", value: "R$ 4.540", note: "3 contas", icon: Clock3, tone: "text-primary", fill: "bg-secondary" },
          { label: "Vencendo", value: "R$ 380", note: "em 2 dias", icon: AlertCircle, tone: "text-chart-1", fill: "bg-chart-1/15" },
          { label: "Pagas no mês", value: "R$ 210", note: "2 contas", icon: CheckCircle2, tone: "text-success", fill: "bg-success/15" },
          { label: "A receber", value: "R$ 1.150", note: "clientes", icon: Clock3, tone: "text-chart-3", fill: "bg-accent/20" },
        ]} />
        <Panel eyebrow="Setembro" title="Todas as contas" className="mt-5">
          <div className="divide-y divide-border">
            {bills.map((b) => (
              <div key={b.name} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3.5 sm:grid-cols-[1fr_6rem_7rem_6rem]">
                <p className="text-sm font-semibold">{b.name}</p>
                <span className="hidden text-sm text-muted-foreground sm:block">{b.due}</span>
                <strong className="text-sm">{b.value}</strong>
                <span className={`hidden w-fit rounded-full px-3 py-1 text-xs font-medium sm:block ${statusStyle[b.status]}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

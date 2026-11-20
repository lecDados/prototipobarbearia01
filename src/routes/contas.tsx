import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
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

function valorNumerico(valor: string) {
  return Number(valor.replace(/[^\d,]/g, "").replace(",", "."));
}

function formatarReais(valor: number) {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function Contas() {
  const [contas, setContas] = useState(bills);

  const abertas = contas.filter((c) => c.status !== "Paga");
  const vencendo = contas.filter((c) => c.status === "Vencendo");
  const pagas = contas.filter((c) => c.status === "Paga");

  const excluir = (nome: string) => {
    setContas((atual) => atual.filter((c) => c.name !== nome));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Financeiro" title="Contas" action={<PrimaryButton><Plus size={16} className="mr-1" />Nova conta</PrimaryButton>} />
        <StatGrid items={[
          { label: "A pagar", value: formatarReais(abertas.reduce((t, c) => t + valorNumerico(c.value), 0)), note: `${abertas.length} contas`, icon: Clock3, tone: "text-primary", fill: "bg-secondary" },
          { label: "Vencendo", value: formatarReais(vencendo.reduce((t, c) => t + valorNumerico(c.value), 0)), note: `${vencendo.length} contas`, icon: AlertCircle, tone: "text-chart-1", fill: "bg-chart-1/15" },
          { label: "Pagas no mês", value: formatarReais(pagas.reduce((t, c) => t + valorNumerico(c.value), 0)), note: `${pagas.length} contas`, icon: CheckCircle2, tone: "text-success", fill: "bg-success/15" },
          { label: "A receber", value: "R$ 1.150", note: "clientes", icon: Clock3, tone: "text-chart-3", fill: "bg-accent/20" },
        ]} />
        <Panel eyebrow="Setembro" title="Todas as contas" className="mt-5">
          {contas.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
          ) : (
            <div className="divide-y divide-border">
              {contas.map((b) => (
                <div key={b.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3.5 sm:grid-cols-[1fr_6rem_7rem_6rem_2.5rem]">
                  <p className="text-sm font-semibold">{b.name}</p>
                  <span className="hidden text-sm text-muted-foreground sm:block">{b.due}</span>
                  <strong className="text-sm">{b.value}</strong>
                  <span className={`hidden w-fit rounded-full px-3 py-1 text-xs font-medium sm:block ${statusStyle[b.status]}`}>{b.status}</span>
                  <button
                    type="button"
                    onClick={() => excluir(b.name)}
                    aria-label={`Excluir ${b.name}`}
                    title={`Excluir ${b.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

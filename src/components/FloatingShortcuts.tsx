import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleDollarSign, Clock3, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFinanceiro } from "@/hooks/use-financeiro";
import { formatBRL } from "@/lib/financeiro";
import { bills } from "@/lib/indicadores";

type View = "recebidos" | "pendentes" | "pagos";

export function FloatingShortcuts() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("recebidos");
  const financeiro = useFinanceiro();
  const registros = financeiro.lancamentos.filter((item) => item.tipo === (view === "recebidos" ? "entrada" : "saida"));
  const contas = bills.filter((item) => view === "pendentes" ? item.status !== "Paga" : item.status === "Paga");

  return (
    <>
      <div className="fixed bottom-6 right-24 z-40 flex gap-3" aria-label="Atalhos rápidos">
        <Button asChild size="icon" variant="ghost" className="liquid-button h-14 w-14 rounded-full bg-floating-queue text-floating-queue-foreground shadow-soft transition hover:bg-floating-queue hover:scale-105 active:scale-95 motion-reduce:transform-none [&_svg]:size-[22px]">
          <Link to="/fila" aria-label="Abrir fila" title="Fila online"><ListOrdered aria-hidden="true" /></Link>
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)} aria-label="Detalhes de pagamento" title="Detalhes de pagamento" className="liquid-button h-14 w-14 rounded-full bg-queue-action text-queue-action-foreground shadow-soft transition hover:bg-queue-action-hover hover:text-queue-action-foreground hover:scale-105 active:scale-95 motion-reduce:transform-none [&_svg]:size-[22px]">
          <CircleDollarSign aria-hidden="true" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85svh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="tracking-normal">Detalhes de pagamento</DialogTitle>
            <DialogDescription>Recebimentos registrados e situação das contas.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Situação do pagamento">
            {([
              { id: "recebidos", label: "Recebidos", icon: CircleDollarSign },
              { id: "pendentes", label: "Pendentes", icon: Clock3 },
              { id: "pagos", label: "Pagos", icon: CheckCircle2 },
            ] as const).map((tab) => (
              <Button key={tab.id} id={`pagamento-${tab.id}`} role="tab" aria-selected={view === tab.id} aria-controls="pagamentos-lista" variant={view === tab.id ? "default" : "ghost"} onClick={() => setView(tab.id)} className="gap-1 px-1 text-xs sm:gap-2 sm:text-sm">
                <tab.icon aria-hidden="true" />{tab.label}
              </Button>
            ))}
          </div>
          <div id="pagamentos-lista" role="tabpanel" aria-labelledby={`pagamento-${view}`}>
            {view !== "pendentes" && (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <h3 className="text-sm font-semibold">{view === "recebidos" ? "Recebimentos registrados" : "Despesas registradas"}</h3>
                  <strong className="text-sm">{financeiro.pronto ? formatBRL(view === "recebidos" ? financeiro.entradas : financeiro.saidas) : "—"}</strong>
                </div>
                {financeiro.erro && <p role="alert" className="text-sm text-destructive">{financeiro.erro}</p>}
                {!financeiro.pronto ? <p className="py-4 text-sm text-muted-foreground">Carregando…</p> : registros.length === 0 ? <p className="py-4 text-sm text-muted-foreground">{view === "recebidos" ? "Nenhum recebimento registrado." : "Nenhuma despesa registrada."}</p> : (
                  <ul className="divide-y divide-border">
                    {registros.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0"><p className="break-words text-sm font-semibold">{item.descricao}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.criadoEm).toLocaleDateString("pt-BR")} · {view === "recebidos" ? "Recebido" : "Pago"}</p></div>
                        <strong className="shrink-0 text-sm text-success">{formatBRL(item.valor)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {view !== "recebidos" && (
              <section className={view === "pagos" ? "mt-5 border-t border-border pt-4" : ""}>
                <h3 className="text-sm font-semibold">Contas demonstrativas · {view === "pendentes" ? "pendentes" : "pagas"}</h3>
                <ul className="mt-2 divide-y divide-border">
                  {contas.map((conta) => (
                    <li key={conta.name} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0"><p className="break-words text-sm font-semibold">{conta.name}</p><p className="mt-1 text-xs text-muted-foreground">{conta.due} · {conta.status}</p></div>
                      <strong className="shrink-0 text-sm">{conta.value}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
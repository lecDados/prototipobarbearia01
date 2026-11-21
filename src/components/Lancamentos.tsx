import { useState } from "react";
import { ArrowDownLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatBRL, type Lancamento } from "@/lib/financeiro";
import { useFinanceiro } from "@/hooks/use-financeiro";

export function Lancamentos({ financeiro }: { financeiro: ReturnType<typeof useFinanceiro> }) {
  const [selecionado, setSelecionado] = useState<Lancamento | null>(null);
  return (
    <section className="glass-tint-panel mt-8 rounded-lg border border-border p-5 shadow-soft sm:p-6" aria-label="Carteira e lançamentos">
      <div><p className="text-xs font-semibold uppercase text-muted-foreground">Carteira</p><h2 className="mt-1 text-xl font-semibold">Lançamentos</h2></div>
      {financeiro.erro && <p role="alert" className="mt-2 text-sm text-destructive">{financeiro.erro}</p>}
      <div className="mt-3 divide-y divide-border">
        {!financeiro.pronto ? <p className="py-6 text-sm text-muted-foreground">Carregando lançamentos…</p> : financeiro.lancamentos.length === 0 ? <p className="py-6 text-sm text-muted-foreground">Nenhum atendimento lançado.</p> : financeiro.lancamentos.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><ArrowDownLeft size={17} /></span>
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{item.descricao}</p><p className="text-xs text-muted-foreground">{new Date(item.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p></div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <strong className="text-sm text-success">+ {formatBRL(item.valor)}</strong>
              <Button size="icon" variant="ghost" disabled={financeiro.excluindo !== null} aria-label={`Excluir lançamento de ${item.descricao}`} title="Excluir lançamento" onClick={() => setSelecionado(item)} className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={selecionado !== null} onOpenChange={(open) => { if (!open && !financeiro.excluindo) setSelecionado(null); }}>
        <DialogContent className="rounded-lg">
          <DialogTitle>Excluir lançamento?</DialogTitle>
          <DialogDescription>{selecionado?.descricao} · {formatBRL(selecionado?.valor ?? 0)}. O valor será retirado da carteira. O atendimento continuará no histórico.</DialogDescription>
          {financeiro.erro && <p role="alert" className="text-sm text-destructive">{financeiro.erro}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={financeiro.excluindo !== null} onClick={() => setSelecionado(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={financeiro.excluindo !== null} onClick={async () => { if (selecionado && await financeiro.remover(selecionado.id)) setSelecionado(null); }}><Trash2 />{financeiro.excluindo ? "Excluindo…" : "Excluir"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatBRL, valorLancamento } from "@/lib/financeiro";
import { useFinanceiro } from "@/hooks/use-financeiro";

export function Lancamentos({ financeiro }: { financeiro: ReturnType<typeof useFinanceiro> }) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  function salvar(e: FormEvent) {
    e.preventDefault();
    const numero = valorLancamento(valor);
    if (!descricao.trim() || numero === null) {
      setErro("Informe a descrição e um valor maior que zero.");
      return;
    }
    if (!financeiro.adicionar({ descricao: descricao.trim(), valor: numero, tipo })) return;
    setConfirmacao(`${tipo === "entrada" ? "Serviço" : "Despesa"} de ${formatBRL(numero)} registrado.`);
    setAberto(false);
    setDescricao("");
    setValor("");
    setErro("");
  }
  const inputClass = "mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  return (
    <section className="glass-tint-panel mt-8 rounded-lg border border-border p-5 shadow-soft sm:p-6" aria-label="Carteira e lançamentos">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Carteira</p><h2 className="mt-1 text-xl font-semibold">Lançamentos</h2></div>
        <Button disabled={!financeiro.pronto} onClick={() => { setAberto(true); setTipo("entrada"); setErro(""); }} className="bg-gradient-brand h-10 rounded-full text-primary-foreground shadow-glow"><Plus />Lançar serviço</Button>
      </div>
      <p role="status" className="mt-3 text-sm text-success">{confirmacao}</p>
      {financeiro.erro && <p role="alert" className="mt-2 text-sm text-destructive">{financeiro.erro}</p>}
      <div className="mt-3 divide-y divide-border">
        {!financeiro.pronto ? <p className="py-6 text-sm text-muted-foreground">Carregando lançamentos…</p> : financeiro.lancamentos.length === 0 ? <p className="py-6 text-sm text-muted-foreground">Nenhum lançamento registrado.</p> : financeiro.lancamentos.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.tipo === "entrada" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{item.tipo === "entrada" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{item.descricao}</p><p className="text-xs text-muted-foreground">{new Date(item.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p></div>
            <strong className={`shrink-0 text-sm ${item.tipo === "entrada" ? "text-success" : "text-destructive"}`}>{item.tipo === "entrada" ? "+" : "−"} {formatBRL(item.valor)}</strong>
          </div>
        ))}
      </div>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg border-border shadow-soft" aria-describedby={undefined}>
          <DialogTitle>Novo lançamento</DialogTitle>
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de lançamento">
              <Button type="button" variant={tipo === "entrada" ? "default" : "outline"} aria-pressed={tipo === "entrada"} onClick={() => setTipo("entrada")}><Scissors />Serviço</Button>
              <Button type="button" variant={tipo === "saida" ? "default" : "outline"} aria-pressed={tipo === "saida"} onClick={() => setTipo("saida")}><ArrowUpRight />Despesa</Button>
            </div>
            <label className="block text-sm font-medium" htmlFor="lancamento-descricao">{tipo === "entrada" ? "Serviço / cliente" : "Descrição da despesa"}<input id="lancamento-descricao" required maxLength={120} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={tipo === "entrada" ? "Corte + Barba — Rafael" : "Conta de energia"} className={inputClass} /></label>
            <label className="block text-sm font-medium" htmlFor="lancamento-valor">Valor (R$)<input id="lancamento-valor" required inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="80,00" className={inputClass} /></label>
            {(erro || financeiro.erro) && <p role="alert" className="text-sm text-destructive">{erro || financeiro.erro}</p>}
            <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => setAberto(false)}>Cancelar</Button><Button type="submit" className="bg-gradient-brand text-primary-foreground">Registrar</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
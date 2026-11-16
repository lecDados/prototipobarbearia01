import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tempoEstimado, useFilaRealtime } from "@/lib/fila";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilaEspera } from "@/components/FilaEspera";
import { chaveProgresso, identidadeFila } from "@/lib/fila-identidade";

export const Route = createFileRoute("/fila_/$codigo")({
  head: () => ({
    meta: [
      { title: "Fila online · Black Studio" },
      { name: "description", content: "Entre na fila da barbearia e acompanhe sua vez em tempo real." },
      { property: "og:title", content: "Fila online · Black Studio" },
      { property: "og:description", content: "Entre na fila da barbearia e acompanhe sua vez em tempo real." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: FilaPublica,
  errorComponent: () => <Tela><p className="text-sm">Não foi possível abrir a fila. Reabra o link recebido.</p></Tela>,
  notFoundComponent: () => <Tela><p className="text-sm">Fila não encontrada. Confira o link recebido.</p></Tela>,
});

type Dados = {
  nome: string;
  aberta: boolean;
  minutos: number;
  clientes: { id: string; nome: string; status: string }[];
};
type Minha = { id: string; token: string };

function FilaPublica() {
  const { codigo } = Route.useParams();
  const chave = `fila:${codigo}`;
  const [dados, setDados] = useState<Dados | null | undefined>(undefined);
  const [minha, setMinha] = useState<Minha | null>(null);
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [identificada, setIdentificada] = useState(false);

  useEffect(() => {
    let ativa = true;
    setIdentificada(false);
    setMinha(null);
    async function restaurar() {
      try {
        const entrada = identidadeFila(JSON.parse(localStorage.getItem(chave) ?? "null"));
        if (entrada) {
          const { data, error } = await supabase.rpc("fila_cliente", { _slug: codigo, _id: entrada.id, _token: entrada.token });
          if (error) throw error;
          if (ativa && data) setMinha(entrada);
          else if (!data) localStorage.removeItem(chave);
        }
      } catch { if (ativa) setErro("Não foi possível recuperar sua entrada. Reabra o link para tentar novamente."); }
      finally { if (ativa) setIdentificada(true); }
    }
    void restaurar();
    return () => { ativa = false; };
  }, [chave, codigo]);

  const carregar = useCallback(async () => {
    const { data } = await supabase.rpc("fila_publica", { _slug: codigo });
    setDados((data as Dados | null) ?? null);
  }, [codigo]);

  useEffect(() => {
    carregar();
  }, [carregar]);
  useFilaRealtime(codigo, carregar);

  const minhaPos = minha && dados ? dados.clientes.findIndex((c) => c.id === minha.id) : -1;
  // Saiu da lista (concluído/cancelado): limpa o estado local
  useEffect(() => {
    if (minha && dados && minhaPos === -1) {
      localStorage.removeItem(chave);
      localStorage.removeItem(`${chaveProgresso(codigo, minha.id)}:tempo`);
      setMinha(null);
    }
  }, [minha, dados, minhaPos, chave, codigo]);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro(null);
    const { data, error } = await supabase.rpc("entrar_fila", { _slug: codigo, _nome: nome, _whatsapp: whats });
    if (error) setErro(error.message);
    else {
      const m = identidadeFila(data);
      if (!m) {
        setErro("Não foi possível confirmar sua entrada.");
        setBusy(false);
        return;
      }
      localStorage.setItem(chave, JSON.stringify(m));
      await carregar();
      setMinha(m);
    }
    setBusy(false);
  }

  async function sair() {
    if (!minha) return;
    const { error } = await supabase.rpc("sair_fila", { _id: minha.id, _token: minha.token });
    if (error) { setErro("Não foi possível sair da fila. Tente novamente."); return; }
    localStorage.removeItem(chave);
    localStorage.removeItem(`${chaveProgresso(codigo, minha.id)}:tempo`);
    setMinha(null);
    carregar();
  }

  if (dados === undefined || !identificada) return <Tela><p className="text-center text-sm text-muted-foreground">Carregando…</p></Tela>;
  if (dados === null) return <Tela><p className="text-center text-sm">Fila não encontrada. Confira o link.</p></Tela>;

  const aFrente = minhaPos;
  const eu = minhaPos >= 0 ? dados.clientes[minhaPos] : null;

  return (
    <Tela>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fila online</p>
      <h1 className="mt-1 text-2xl font-semibold">{dados.nome}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{dados.clientes.length} na fila agora</p>

      {eu ? (
        <div className="bg-gradient-brand mt-5 rounded-lg p-5 text-primary-foreground">
          <p role="status" className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BadgeCheck size={22} className="shrink-0" aria-hidden="true" /> Entrada confirmada
          </p>
          {eu.status === "atendendo" ? (
            <p className="text-xl font-semibold">É a sua vez! Você está sendo atendido.</p>
          ) : (
            <>
              <p className="text-sm opacity-80">Sua posição</p>
              <p className="text-5xl font-semibold">{minhaPos + 1}º</p>
              <p className="mt-2 text-sm opacity-80">{aFrente} à sua frente</p>
              <FilaEspera
                chave={chaveProgresso(codigo, eu.id)}
                assinatura={`${eu.id}:${dados.minutos}:${dados.clientes.slice(0, minhaPos + 1).map((c) => `${c.id}:${c.status}`).join(",")}`}
                minutos={tempoEstimado(minhaPos + 1, dados.minutos)}
              />
            </>
          )}
          <Button onClick={sair} variant="ghost" className="mt-4 h-11 w-full bg-glass/25 text-primary-foreground hover:bg-glass/30 hover:text-primary-foreground">Sair da fila</Button>
        </div>
      ) : dados.aberta ? (
        <form onSubmit={entrar} className="mt-5 space-y-3">
          <input required maxLength={60} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-3 text-base" />
          <input required inputMode="tel" placeholder="WhatsApp com DDD" value={whats} onChange={(e) => setWhats(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-3 text-base" />
          <Button type="submit" disabled={busy} className="h-12 w-full text-base font-semibold">{busy ? "Entrando…" : "Entrar na fila"}</Button>
        </form>
      ) : (
        <p className="mt-5 rounded-lg bg-muted p-4 text-center text-sm">A fila está fechada no momento.</p>
      )}
      {erro && <p role="alert" className="mt-3 text-sm text-destructive">{erro}</p>}

      {dados.clientes.length > 0 && (
        <ol className="mt-6 divide-y divide-border rounded-xl bg-card">
          {dados.clientes.map((c, i) => (
            <li key={c.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${c.id === minha?.id ? "font-semibold text-primary" : ""}`}>
              <span className="w-6 text-muted-foreground">{i + 1}º</span>
              <span className="flex-1">{c.nome}{c.id === minha?.id ? " (você)" : ""}</span>
              {c.status === "atendendo" && <span className="text-xs text-success">atendendo</span>}
            </li>
          ))}
        </ol>
      )}
    </Tela>
  );
}

function Tela({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-background px-4 py-8">
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}

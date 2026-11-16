import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tempoEstimado, useFilaRealtime } from "@/lib/fila";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilaEspera } from "@/components/FilaEspera";
import { chaveProgresso, identidadeFila } from "@/lib/fila-identidade";
import { Checkbox } from "@/components/ui/checkbox";
import { diaSaoPaulo, horaReserva, reservaDisponivel, type HorarioFila } from "@/lib/fila-horarios";

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
  const [agendar, setAgendar] = useState(false);
  const [dia, setDia] = useState(diaSaoPaulo);
  const [inicio, setInicio] = useState("");
  const [horarios, setHorarios] = useState<HorarioFila[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [reserva, setReserva] = useState<{ inicio: string; status: string } | null>(null);

  const carregarHorarios = useCallback(async () => {
    setCarregandoHorarios(true);
    try {
      const { data, error } = await supabase.rpc("horarios_fila", { _slug: codigo, _dia: dia });
      if (error) throw error;
      setHorarios((data as HorarioFila[] | null) ?? []);
    } catch { setHorarios([]); setErro("Não foi possível consultar os horários. Tente novamente."); }
    finally { setCarregandoHorarios(false); }
  }, [codigo, dia]);
  useEffect(() => { setInicio(""); if (agendar) void carregarHorarios(); }, [agendar, carregarHorarios]);
  useEffect(() => {
    if (!agendar) return;
    const timer = setInterval(carregarHorarios, 10000);
    return () => clearInterval(timer);
  }, [agendar, carregarHorarios]);

  useEffect(() => {
    let ativa = true;
    setIdentificada(false);
    setMinha(null);
    setReserva(null);
    async function restaurar() {
      try {
        const entrada = identidadeFila(JSON.parse(localStorage.getItem(chave) ?? "null"));
        if (entrada) {
          const { data, error } = await supabase.rpc("fila_cliente", { _slug: codigo, _id: entrada.id, _token: entrada.token });
          if (error) throw error;
          if (ativa && data) {
            const { data: agendamento, error: erroReserva } = await supabase.rpc("fila_agendamento_cliente", { _slug: codigo, _id: entrada.id, _token: entrada.token });
            if (erroReserva) throw erroReserva;
            if (ativa) { setReserva(agendamento as { inicio: string; status: string } | null); setMinha(entrada); }
          }
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
    if (minha && dados && minhaPos === -1 && !reserva) {
      localStorage.removeItem(chave);
      localStorage.removeItem(`${chaveProgresso(codigo, minha.id)}:tempo`);
      setMinha(null);
    }
  }, [minha, dados, minhaPos, chave, codigo, reserva]);

  useEffect(() => {
    if (!minha || !reserva) return;
    const timer = setInterval(async () => {
      const { data, error } = await supabase.rpc("fila_agendamento_cliente", { _slug: codigo, _id: minha.id, _token: minha.token });
      if (!error) setReserva(data as { inicio: string; status: string } | null);
    }, 10000);
    return () => clearInterval(timer);
  }, [minha, reserva, codigo]);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (agendar && !reservaDisponivel(horarios, inicio)) { setErro("Escolha um horário disponível."); return; }
    setBusy(true);
    setErro(null);
    const { data, error } = agendar
      ? await supabase.rpc("reservar_fila", { _slug: codigo, _nome: nome, _whatsapp: whats, _inicio: inicio })
      : await supabase.rpc("entrar_fila", { _slug: codigo, _nome: nome, _whatsapp: whats });
    if (error) { setErro(error.message); if (agendar) { setInicio(""); await carregarHorarios(); } }
    else {
      const m = identidadeFila(data);
      if (!m) {
        setErro("Não foi possível confirmar sua entrada.");
        setBusy(false);
        return;
      }
      localStorage.setItem(chave, JSON.stringify(m));
      if (agendar) setReserva({ inicio, status: "aguardando" });
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
    setReserva(null);
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

      {reserva ? (
        <div className="mt-5 rounded-lg bg-primary/10 p-5">
          <p role="status" className="flex items-center gap-2 font-semibold text-primary"><BadgeCheck size={22} /> Horário reservado</p>
          <p className="mt-4 text-3xl font-semibold">{horaReserva(reserva.inicio)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{new Date(reserva.inicio).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" })}</p>
          {reserva.status === "atendendo" && <p className="mt-3 text-success">Você está sendo atendido.</p>}
          <Button variant="outline" onClick={sair} className="mt-5 w-full">Cancelar reserva</Button>
        </div>
      ) : eu ? (
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
          <div className="flex items-center gap-3 py-2">
            <Checkbox id="reservar" checked={agendar} onCheckedChange={(checked) => { setAgendar(checked === true); setErro(null); }} disabled={busy} />
            <label htmlFor="reservar" className="cursor-pointer text-sm font-medium">Quero reservar um horário específico</label>
          </div>
          {agendar && (
            <div className="space-y-3 border-t border-border pt-3">
              <label htmlFor="dia-reserva" className="block text-sm font-semibold">Data</label>
              <input id="dia-reserva" type="date" required min={diaSaoPaulo()} max={diaSaoPaulo(new Date(Date.now() + 30 * 86400000))} value={dia} onChange={(e) => setDia(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base dark:scheme-dark" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>9h às 20h</span><span>Ocupados indisponíveis</span></div>
              {carregandoHorarios && horarios.length === 0 ? <p className="text-sm text-muted-foreground">Consultando horários…</p> : (
                <div className="grid grid-cols-4 gap-2" role="group" aria-label="Horários disponíveis">
                  {horarios.map((h) => <Button key={h.inicio} type="button" variant={inicio === h.inicio ? "default" : "outline"} disabled={!h.disponivel || busy} aria-pressed={inicio === h.inicio} aria-label={`${horaReserva(h.inicio)}${h.disponivel ? " disponível" : " indisponível"}`} onClick={() => setInicio(h.inicio)} className="h-11 px-1 tabular-nums">{horaReserva(h.inicio)}</Button>)}
                </div>
              )}
            </div>
          )}
          <Button type="submit" disabled={busy || (agendar && !reservaDisponivel(horarios, inicio))} className="h-12 w-full text-base font-semibold">{busy ? (agendar ? "Reservando…" : "Entrando…") : agendar ? "Reservar horário" : "Entrar na fila"}</Button>
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

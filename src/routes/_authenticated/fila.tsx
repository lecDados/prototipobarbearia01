import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, LogOut, Play, Power } from "lucide-react";
import { AppShell, PageHeader, Panel, pageHead } from "@/components/AppShell";
import { useFilaRealtime } from "@/lib/fila";
import { painelFila } from "@/lib/fila-painel.functions";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/fila")({
  head: () => pageHead("Fila online", "Gerencie a fila de espera online da barbearia em tempo real."),
  component: FilaPainel,
});

type Barbearia = { id: string; slug: string; fila_aberta: boolean; minutos_por_cliente: number };
type Cliente = { id: string; nome: string; whatsapp: string; status: string; criado_em: string; agendado_em: string | null };

function FilaPainel() {
  const consultar = useServerFn(painelFila);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [barb, setBarb] = useState<Barbearia | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const [origem, setOrigem] = useState("");
  useEffect(() => setOrigem(window.location.origin), []);

  const carregar = useCallback(async () => {
    try {
      const resultado = await consultar({ data: { acao: "ler" } });
      setBarb(resultado.autorizado ? resultado.barb : null);
      setClientes(resultado.autorizado ? resultado.clientes : []);
      setErro("");
    } catch { setErro("Não foi possível carregar a fila. Tente novamente."); }
    finally { setCarregando(false); }
  }, [consultar]);

  useEffect(() => {
    carregar();
  }, [carregar]);
  useFilaRealtime(barb?.slug, carregar);

  async function status(id: string, s: "atendendo" | "concluido") {
    setBusy(true);
    try {
      const resultado = await consultar({ data: { acao: "status", id, status: s } });
      if (!resultado.autorizado) { setBarb(null); setClientes([]); return; }
      await carregar();
    } catch { setErro("Não foi possível atualizar o atendimento."); }
    finally { setBusy(false); }
  }

  async function atualizar(campos: Partial<Barbearia>) {
    if (!barb) return;
    try {
      const resultado = await consultar({ data: { acao: "configurar", aberta: campos.fila_aberta, minutos: campos.minutos_por_cliente } });
      if (!resultado.autorizado) { setBarb(null); setClientes([]); return; }
      setBarb(resultado.barb);
      setErro("");
    } catch { setErro("Não foi possível atualizar a fila."); }
  }

  const link = barb ? `${origem}/fila/${barb.slug}` : "";
  const fila = clientes.filter((c) => !c.agendado_em);
  const reservas = clientes.filter((c) => c.agendado_em).sort((a, b) => (a.agendado_em ?? "").localeCompare(b.agendado_em ?? ""));
  const proximo = fila.find((c) => c.status === "aguardando");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader eyebrow="Atendimento" title="Fila online" />
        {erro && <p role="alert" className="mt-4 text-sm text-destructive">{erro}</p>}
        {carregando ? (
          <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
        ) : !barb ? <p className="mt-8 text-sm text-muted-foreground">Não foi possível abrir a fila desta conta.</p> : (
          <>
            <div className="mt-8 rounded-lg bg-card p-5 shadow-glow">
              <div className="grid gap-5 lg:grid-cols-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Na fila</p>
                <p className="mt-1 text-4xl font-semibold">{fila.length}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fila</p>
                <Button
                  onClick={() => atualizar({ fila_aberta: !barb.fila_aberta })}
                  aria-pressed={barb.fila_aberta}
                  className="bg-gradient-brand mt-2 h-11 max-w-full gap-2 rounded-lg border border-primary/25 px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Power size={16} aria-hidden="true" />
                  {barb.fila_aberta ? "Aberta · clique para fechar" : "Fechada · clique para abrir"}
                </Button>
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" htmlFor="min">Minutos por cliente</label>
                <input
                  id="min"
                  type="number"
                  min={5}
                  max={180}
                  defaultValue={barb.minutos_por_cliente}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 5 && v <= 180 && v !== barb.minutos_por_cliente) atualizar({ minutos_por_cliente: v });
                  }}
                  className="mt-2 w-24 rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <span className="min-w-0 basis-full break-all text-sm text-muted-foreground sm:flex-1 sm:basis-auto">{link}</span>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2000);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />} {copiado ? "Copiado!" : "Copiar link da fila"}
              </Button>
              </div>
            </div>

            <Panel eyebrow="Ordem de chegada" title="Clientes em espera" className="mt-5">
              {fila.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Ninguém na fila agora.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {fila.map((c, i) => {
                    const destaque = c.id === proximo?.id;
                    return (
                      <li key={c.id} className={`flex flex-wrap items-center gap-3 py-3.5 ${destaque ? "-mx-3 rounded-lg bg-primary/10 px-3" : ""}`}>
                        <span className="w-7 text-sm font-semibold text-muted-foreground">{i + 1}º</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {c.nome}
                            {destaque && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Próximo</span>}
                            {c.status === "atendendo" && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Em atendimento</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.whatsapp} · chegou {new Date(c.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {c.status === "aguardando" && (
                          <Button disabled={busy} variant="outline" onClick={() => status(c.id, "atendendo")} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium">
                            <Play size={14} /> Atender
                          </Button>
                        )}
                        <Button disabled={busy} onClick={() => status(c.id, "concluido")} className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-sm font-medium text-success-foreground">
                          <Check size={14} /> Concluir
                        </Button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Panel>

            <Panel eyebrow="Horários reservados" title="Agendamentos" className="mt-5">
              {reservas.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum horário reservado.</p> : (
                <ol className="divide-y divide-border">
                  {reservas.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{c.nome}</p>
                        <p className="text-sm text-muted-foreground">{c.agendado_em && new Date(c.agendado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · {c.whatsapp}</p>
                        {c.status === "atendendo" && <p className="text-xs text-success">Em atendimento</p>}
                      </div>
                      {c.status === "aguardando" && <Button variant="outline" disabled={busy} onClick={() => status(c.id, "atendendo")}><Play size={14} /> Atender</Button>}
                      <Button disabled={busy} onClick={() => status(c.id, "concluido")}><Check size={14} /> Concluir</Button>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Button variant="ghost"
              onClick={async () => {
                try {
                  await queryClient.cancelQueries();
                  queryClient.clear();
                  await supabase.auth.signOut();
                  setBarb(null);
                  setClientes([]);
                  await navigate({ to: "/auth", replace: true });
                } catch { setErro("Não foi possível sair da conta."); }
              }}
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <LogOut size={14} /> Sair da conta
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
}

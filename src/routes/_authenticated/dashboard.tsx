import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CircleDollarSign, Clock3, Crown, Users, WalletCards } from "lucide-react";
import { AppShell, PageHeader, Panel, StatCard, StatCombo, pageHead } from "@/components/AppShell";
import { Lancamentos } from "@/components/Lancamentos";
import { useFinanceiro } from "@/hooks/use-financeiro";
import { formatBRL } from "@/lib/financeiro";
import { dashboardQuery, useDashboard } from "@/hooks/use-dashboard";
import { desempenhoReal } from "@/lib/dashboard";
import { diaSaoPaulo, horaReserva } from "@/lib/fila-horarios";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead("Dashboard e Carteira", "Agenda, lançamentos de serviços, despesas e ganhos da Black Studio em uma única página."),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  errorComponent: () => <AppShell><p role="alert" className="mt-8 text-destructive">Não foi possível carregar a dashboard. Tente novamente.</p></AppShell>,
  notFoundComponent: () => <AppShell><p className="mt-8">Dashboard não encontrada.</p></AppShell>,
  component: Dashboard,
});

function ProSection({ financeiro, dados }: { financeiro: ReturnType<typeof useFinanceiro>; dados: ReturnType<typeof useDashboard> }) {
  // Troque para true quando existir a verificação real do plano Pro.
  const temPlanoPro = false;
  const desempenho = desempenhoReal(dados.clientes, financeiro.lancamentos, dados.agora);
  const maior = Math.max(1, ...desempenho.dias.map(Math.abs));
  const pontosReais = desempenho.dias.map((v, i) => `${10 + i * 9},${60 - (v / maior) * 48}`).join(" ");
  // Sem plano Pro, a área mostra apenas dados de exemplo (os reais nem chegam ao navegador).
  const pontos = temPlanoPro ? pontosReais : "10,50 50,38 90,44 130,22 170,30 210,12 250,24 290,10";
  const saldo = temPlanoPro ? (financeiro.pronto ? formatBRL(desempenho.saldoMes) : "—") : "R$ 0.000,00";
  const temLancamentos = temPlanoPro ? financeiro.lancamentos.length > 0 : true;
  const servicos: [string, number | string][] = temPlanoPro
    ? desempenho.servicos
    : [["Corte", "00"], ["Barba", "00"], ["Combo", "00"]];
  const rotulo = "text-xs font-semibold uppercase opacity-75";
  const bloco = "rounded-lg border border-pro-border/60 bg-pro/50 p-4";
  return (
    <section className="mt-5 rounded-lg border border-pro-border bg-pro/70 p-4 text-pro-foreground sm:p-5">
      <h2 className="flex items-center text-lg font-semibold">
        <Crown size={19} className="mr-3" aria-hidden="true" />
        Desempenho
        <span className="ml-auto rounded-full bg-pro-foreground/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">Pro</span>
      </h2>
      <div className="relative mt-4">
        <div
          className={temPlanoPro ? "" : "pointer-events-none select-none blur-[6px]"}
          aria-hidden={!temPlanoPro}
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className={bloco}>
              <p className={rotulo}>Saldo do mês</p>
              <p className="mt-2 text-2xl font-semibold">{saldo}</p>
              {temLancamentos ? (
                <svg aria-label="Saldo diário do mês" viewBox="0 0 300 120" className="mt-3 h-32 w-full">
                  <polyline points={pontos} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <p className="mt-3 text-sm opacity-75">Nenhum lançamento registrado.</p>
              )}
            </div>
            <div className={bloco}>
              <p className={rotulo}>Serviços concluídos</p>
              <div className="mt-3 divide-y divide-pro-border/40">
                {servicos.length ? (
                  servicos.map(([nome, quantidade]) => (
                    <div key={nome} className="flex justify-between gap-3 py-2 text-sm">
                      <span>{nome}</span>
                      <strong>{quantidade}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-75">Nenhum serviço concluído com tipo informado.</p>
                )}
              </div>
            </div>
            <div className={bloco}>
              <p className={rotulo}>Consumo de estoque</p>
              <p className="mt-3 text-sm opacity-75">Nenhuma movimentação de consumo registrada.</p>
            </div>
          </div>
        </div>
        {!temPlanoPro && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-pro/40 p-4">
            <div className="max-w-xs rounded-lg border border-pro-border bg-pro px-5 py-4 text-center shadow-lg">
              <p className="text-base font-semibold">Assine e mude para o plano Pro</p>
              <p className="mt-1 text-xs opacity-75">Desbloqueie o desempenho completo da sua barbearia.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
function Dashboard() {
  const financeiro = useFinanceiro();
  const dados = useDashboard();
  const proximo = dados.proximo;
  const espera = proximo?.agendado_em ? Math.max(0, Math.ceil((Date.parse(proximo.agendado_em) - dados.agora.getTime()) / 60000)) : 0;
  const total = (valor: number) => financeiro.pronto ? formatBRL(valor) : "—";
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Visão geral e financeiro" title="Dashboard" showHighlights />
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCombo
            className="sm:col-span-2 xl:col-span-3"
            items={[
              { label: "Agendamentos", value: String(dados.agenda.length), note: `${dados.agendamentosHoje} hoje`, icon: CalendarDays, tone: "text-chart-2", fill: "bg-glass" },
              { label: "Clientes atendidos", value: String(dados.atendidos), note: `${dados.aguardando} aguardando`, icon: Users, tone: "text-chart-3", fill: "bg-glass" },
              { label: "Próximo horário", value: proximo?.agendado_em ? horaReserva(proximo.agendado_em) : "—", note: proximo?.agendado_em ? `${diaSaoPaulo(new Date(proximo.agendado_em)) === diaSaoPaulo(dados.agora) ? `em ${espera} min` : new Date(proximo.agendado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "Sem reserva futura", icon: Clock3, tone: "text-chart-1", fill: "bg-glass" },
            ]}
          />
          <StatCard
            color="earnings"
            item={{ label: "Ganhos de hoje", value: total(financeiro.ganhosHoje), note: "Serviços", icon: CircleDollarSign, tone: "text-success", fill: "bg-success/15" }}
          />
        </section>
        <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Resumo financeiro">
          <StatCard color="income" item={{ label: "Entradas", value: total(financeiro.entradas), note: "Total", icon: CircleDollarSign, tone: "text-chart-3", fill: "bg-chart-3/20" }} />
          <StatCard color="expenses" item={{ label: "Saídas", value: total(financeiro.saidas), note: "Despesas", icon: WalletCards, tone: "text-chart-1", fill: "bg-chart-1/20" }} />
        </section>
        <Lancamentos financeiro={financeiro} />
        <section className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <Panel eyebrow="Agenda" title="Próximos clientes" variant="dark">
            <div className="relative pl-6">
              <span aria-hidden className="bg-gradient-agenda absolute inset-y-3 left-0 w-[3px] rounded-full" />
              <span aria-hidden className="bg-gradient-agenda absolute inset-y-3 left-[-2px] w-[7px] rounded-full opacity-25 blur-[3px]" />
              <div className="divide-y divide-surface-dark-border">
                {dados.agenda.length === 0 && <p className="py-6 text-sm text-surface-dark-muted">Nenhum horário reservado na fila online.</p>}
                {dados.agenda.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 py-4">
                    <div className="w-16 shrink-0"><p className="text-sm font-semibold">{a.agendado_em ? horaReserva(a.agendado_em) : "—"}</p><p className="mt-1 text-xs text-surface-dark-muted">{a.agendado_em && new Date(a.agendado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" })}</p></div>
                    <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{a.nome}</p><p className="mt-1 break-words text-sm text-surface-dark-muted">{a.servico || "Serviço não informado"}</p><p className="mt-1 text-xs text-surface-dark-muted">{a.status === "atendendo" ? "Em atendimento" : "Reservado"}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4 border-surface-dark-border bg-transparent text-surface-dark-foreground hover:bg-surface-dark-hover hover:text-surface-dark-foreground"><Link to="/fila">Abrir fila online</Link></Button>
          </Panel>
          <aside className="bg-gradient-brand flex min-h-72 flex-col justify-between rounded-lg p-6 text-primary-foreground shadow-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-glass/25"><WalletCards size={21} /></div>
            <div>
              <p className="text-sm opacity-80">Saldo da carteira</p>
              <p className="mt-1 break-words text-3xl font-semibold">{total(financeiro.saldo)}</p>
              <div className="mt-5 flex justify-between border-t border-glass/30 pt-4 text-sm"><span className="opacity-80">Lançamentos</span><strong>{financeiro.lancamentos.length}</strong></div>
            </div>
          </aside>
        </section>
        <ProSection financeiro={financeiro} dados={dados} />
      </div>
    </AppShell>
  );
}

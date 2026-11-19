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
  const desempenho = desempenhoReal(dados.clientes, financeiro.lancamentos, dados.agora);
  const maior = Math.max(1, ...desempenho.dias.map(Math.abs));
  const pontos = desempenho.dias.map((v, i) => `${10 + i * 9},${60 - (v / maior) * 48}`).join(" ");
  return (
    <section className="mt-5 border-t border-border py-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Crown size={18} className="text-pro-foreground" /> Desempenho</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Saldo do mês</p><p className="mt-2 text-2xl font-semibold">{financeiro.pronto ? formatBRL(desempenho.saldoMes) : "—"}</p>
          {financeiro.lancamentos.length ? <svg aria-label="Saldo diário do mês" viewBox="0 0 300 120" className="mt-3 h-32 w-full"><polyline points={pontos} fill="none" stroke="var(--color-chart-1)" strokeWidth="3" /></svg> : <p className="mt-3 text-sm text-muted-foreground">Nenhum lançamento registrado.</p>}
        </div>
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Serviços concluídos</p><div className="mt-3 divide-y divide-border">{desempenho.servicos.length ? desempenho.servicos.map(([nome, quantidade]) => <div key={nome} className="flex justify-between gap-3 py-2 text-sm"><span>{nome}</span><strong>{quantidade}</strong></div>) : <p className="text-sm text-muted-foreground">Nenhum serviço concluído com tipo informado.</p>}</div></div>
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Consumo de estoque</p><p className="mt-3 text-sm text-muted-foreground">Nenhuma movimentação de consumo registrada.</p></div>
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
          <Panel eyebrow="Agenda" title="Próximos clientes">
            <div className="divide-y divide-border">
              {dados.agenda.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nenhum horário reservado na fila online.</p>}
              {dados.agenda.map((a) => (
                <div key={a.id} className="flex items-start gap-4 py-4">
                  <div className="w-16 shrink-0"><p className="text-sm font-semibold">{a.agendado_em ? horaReserva(a.agendado_em) : "—"}</p><p className="mt-1 text-xs text-muted-foreground">{a.agendado_em && new Date(a.agendado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" })}</p></div>
                  <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{a.nome}</p><p className="mt-1 break-words text-sm text-muted-foreground">{a.servico || "Serviço não informado"}</p><p className="mt-1 text-xs text-muted-foreground">{a.status === "atendendo" ? "Em atendimento" : "Reservado"}</p></div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4"><Link to="/fila">Abrir fila online</Link></Button>
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

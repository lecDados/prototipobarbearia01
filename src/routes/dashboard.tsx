import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CircleDollarSign, Clock3, Crown, Users, WalletCards } from "lucide-react";
import { AppShell, PageHeader, Panel, StatCard, StatCombo, pageHead } from "@/components/AppShell";
import { Lancamentos } from "@/components/Lancamentos";
import { useFinanceiro } from "@/hooks/use-financeiro";
import { formatBRL } from "@/lib/financeiro";

export const Route = createFileRoute("/dashboard")({
  head: () => pageHead("Dashboard e Carteira", "Agenda, lançamentos de serviços, despesas e ganhos da Black Studio em uma única página."),
  component: Dashboard,
});

const appointments = [
  { time: "09:30", client: "Rafael Mendes", service: "Corte + Barba", barber: "Marcos", tone: "bg-primary" },
  { time: "11:00", client: "João Vitor", service: "Degradê", barber: "André", tone: "bg-chart-3" },
  { time: "13:30", client: "Caio Lima", service: "Barba premium", barber: "Marcos", tone: "bg-chart-1" },
  { time: "15:00", client: "Pedro Alves", service: "Corte executivo", barber: "Lucas", tone: "bg-success" },
];

const monthFlow = [42, 55, 38, 64, 50, 72, 58, 76];
const flowPoints = monthFlow
  .map((v, i) => `${10 + i * 40},${110 - v * 1.15}`)
  .join(" ");

const topServices = [
  { name: "Corte + Barba", share: 34, tone: "bg-chart-1" },
  { name: "Degradê", share: 28, tone: "bg-primary" },
  { name: "Corte clássico", share: 22, tone: "bg-chart-3" },
  { name: "Barba premium", share: 16, tone: "bg-highlight" },
];

const topStock = [
  { name: "Lâminas descartáveis", used: "120 un.", pct: 82, tone: "bg-chart-5" },
  { name: "Óleo para barba", used: "48 un.", pct: 64, tone: "bg-chart-3" },
  { name: "Shampoo premium", used: "36 un.", pct: 48, tone: "bg-chart-4" },
  { name: "Toalhas descartáveis", used: "30 un.", pct: 38, tone: "bg-primary" },
];

function ProSection() {
  return (
    <section className="relative mt-5 overflow-hidden rounded-lg shadow-glow">
      <div className="flex items-center justify-between gap-3 border-b border-pro-border/60 bg-pro/40 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Analytics</p>
          <h2 className="mt-0.5 flex items-center gap-2 text-lg font-semibold">
            <Crown size={18} className="text-pro-foreground" aria-hidden="true" /> Desempenho premium
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-pro px-3 py-1 text-xs font-semibold text-pro-foreground">
          <Crown size={13} aria-hidden="true" /> Pro
        </span>
      </div>

      <div className="relative">
        <div
          className="grid gap-6 p-6 blur-[3px] select-none"
          aria-hidden="true"
        >
          <div className="rounded-lg border border-border bg-glass p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Alta e baixa no mês</p>
            <p className="mt-1 text-3xl font-semibold">R$ 2.480</p>
            <svg viewBox="0 0 300 120" className="mt-4 h-36 w-full" preserveAspectRatio="none">
              <polyline
                points={flowPoints}
                fill="none"
                stroke="var(--color-chart-1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="rounded-lg border border-border bg-glass p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Produto mais vendido</p>
            <div className="mt-3 space-y-2.5">
              {topServices.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="truncate">{s.name}</span>
                    <span className="text-muted-foreground">{s.share}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${s.tone}`} style={{ width: `${s.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-glass p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estoque mais usado</p>
            <div className="mt-3 space-y-2.5">
              {topStock.map((i) => (
                <div key={i.name}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="truncate">{i.name}</span>
                    <span className="text-muted-foreground">{i.used}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${i.tone}`} style={{ width: `${i.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function Dashboard() {
  const financeiro = useFinanceiro();
  const total = (valor: number) => financeiro.pronto ? formatBRL(valor) : "—";
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Visão geral e financeiro" title="Dashboard" showHighlights />
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCombo
            className="sm:col-span-2 xl:col-span-3"
            items={[
              { label: "Agendamentos", value: "18", note: "+3 hoje", icon: CalendarDays, tone: "text-chart-2", fill: "bg-glass" },
              { label: "Clientes atendidos", value: "11", note: "7 aguardando", icon: Users, tone: "text-chart-3", fill: "bg-glass" },
              { label: "Próximo horário", value: "09:30", note: "em 20 min", icon: Clock3, tone: "text-chart-1", fill: "bg-glass" },
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
              {appointments.map((a) => (
                <div key={a.time} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-3.5 sm:grid-cols-[4rem_1.2fr_1fr_auto]">
                  <span className="text-sm font-semibold">{a.time}</span>
                  <div className="flex min-w-0 items-center gap-3"><span className={`h-8 w-1 shrink-0 rounded-full ${a.tone}`} /><p className="truncate text-sm font-semibold">{a.client}</p></div>
                  <span className="hidden text-sm text-muted-foreground sm:block">{a.service}</span>
                  <span className="text-xs font-medium text-muted-foreground">{a.barber}</span>
                </div>
              ))}
            </div>
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
        <ProSection />
      </div>
    </AppShell>
  );
}

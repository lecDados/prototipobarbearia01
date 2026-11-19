import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Boxes,
  CircleDollarSign,
  Crown,
  LayoutDashboard,
  ListOrdered,
  Menu,
  MessageCircle,
  Scissors,
  Star,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import googleG from "@/assets/google-g.png.asset.json";
import { BarberNews } from "@/components/BarberNews";
import { IndicadoresCarousel } from "@/components/IndicadoresCarousel";
import { FloatingShortcuts } from "@/components/FloatingShortcuts";
import { useFinanceiro } from "@/hooks/use-financeiro";
import { formatBRL } from "@/lib/financeiro";
import { useDashboard } from "@/hooks/use-dashboard";
import { horaReserva } from "@/lib/fila-horarios";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

const navigation = [
  { label: "Dashboard e Carteira", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Catálogo de serviços", icon: Scissors, to: "/servicos" },
  { label: "Funcionários", icon: Users, to: "/funcionarios" },
  { label: "Contas", icon: CircleDollarSign, to: "/contas" },
  { label: "Estoque", icon: Boxes, to: "/estoque" },
  { label: "Fila online", icon: ListOrdered, to: "/fila" },
] as const;

export function AppShell({
  children,
  showChat = true,
}: {
  children: ReactNode;
  showChat?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsPro, setWhatsPro] = useState(false);
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-12 pt-4 sm:px-7 lg:px-10">
      <FlowLines />
      <header className="relative z-40 mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
            className="liquid-button glass-strong inline-flex h-12 w-12 items-center justify-center border border-border text-primary shadow-soft transition hover:text-chart-1 active:scale-[0.97]"
          >
            <Menu size={21} strokeWidth={2.2} />
          </button>
          <Link to="/" className="hidden sm:block">
            <p className="text-sm font-semibold">Black Studio</p>
            <p className="text-xs text-muted-foreground">Gestão inteligente</p>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="glass-strong flex h-10 items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 shadow-soft">
            <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
              VB
            </div>
            <span className="text-xs font-semibold">Vanio</span>
          </div>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`glass-strong fixed inset-y-0 left-0 z-50 flex w-[min(88vw,350px)] flex-col overflow-y-auto border-r border-sidebar-border p-5 shadow-soft transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
            <div className="liquid-button bg-gradient-brand flex h-11 w-11 items-center justify-center text-primary-foreground">
              <Scissors size={20} />
            </div>
            <div>
              <p className="font-semibold">Black Studio</p>
              <p className="text-xs text-muted-foreground">Barber management</p>
            </div>
          </Link>
          <button
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="glass-strong inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="mt-10 flex-1 space-y-1.5" aria-label="Menu principal">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex h-12 w-full items-center rounded-lg px-4 text-sm font-medium transition active:scale-[0.97]"
              activeProps={{ className: "bg-gradient-brand text-primary-foreground shadow-glow" }}
              inactiveProps={{ className: "text-foreground hover:bg-secondary/70" }}
            >
              <item.icon size={19} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setWhatsPro((v) => !v)}
          className="mt-5 flex h-12 w-full items-center rounded-lg border border-pro-border bg-pro/70 px-4 text-sm font-semibold text-pro-foreground transition active:scale-[0.97]"
        >
          <Crown size={19} className="mr-3" aria-hidden="true" />
          Conectar WhatsApp
          <span className="ml-auto rounded-full bg-pro-foreground/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            Pro
          </span>
        </button>
        {whatsPro && (
          <p className="mt-2 rounded-lg border border-pro-border/60 bg-pro/50 px-3.5 py-2.5 text-xs text-pro-foreground">
            A conexão com o WhatsApp está disponível apenas no plano Pro.
          </p>
        )}
        <div className="mt-5 rounded-lg border border-border bg-secondary/55 p-4">
          <p className="text-xs text-muted-foreground">Resumo de hoje</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Ocupação da agenda</span>
            <strong className="text-sm text-primary">86%</strong>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-gradient-brand h-full w-[86%] rounded-full" />
          </div>
        </div>
      </aside>

      {showChat && <><FloatingShortcuts /><ChatWidget /></>}
    </main>
  );
}

function FlowLines() {
  // 3 grupos de linhas curvas que nascem no canto superior esquerdo (botão do menu)
  // e descem até o rodapé, cruzando a página de forma orgânica, com volume variável.
  const groups: { paths: string[]; widths: number[]; opacity: number; gradient: string; duration: number }[] = [
    {
      gradient: "flow-a",
      opacity: 0.5,
      duration: 26,
      widths: [3.5, 2, 5, 1.5],
      paths: [
        "M 24 40 C 180 220, -60 380, 220 560 S 60 860, 340 1040 S 120 1340, 420 1560",
        "M 24 40 C 260 180, 20 420, 300 620 S 100 900, 380 1120 S 180 1400, 460 1620",
        "M 24 40 C 120 260, -40 460, 180 680 S 40 960, 300 1180 S 90 1440, 380 1660",
        "M 24 40 C 320 140, 80 360, 360 580 S 160 880, 440 1100 S 240 1380, 520 1600",
      ],
    },
    {
      gradient: "flow-b",
      opacity: 0.35,
      duration: 34,
      widths: [6, 1.5, 3],
      paths: [
        "M 24 40 C 420 260, 120 520, 520 760 S 220 1080, 620 1320 S 320 1620, 700 1880",
        "M 24 40 C 500 200, 200 480, 600 720 S 300 1040, 720 1300 S 400 1600, 780 1860",
        "M 24 40 C 360 320, 60 560, 460 820 S 160 1140, 560 1380 S 260 1660, 640 1920",
      ],
    },
    {
      gradient: "flow-c",
      opacity: 0.28,
      duration: 42,
      widths: [2, 4.5, 1.2, 3],
      paths: [
        "M 24 40 C 90 300, 420 340, 160 640 S 520 820, 240 1120 S 600 1300, 320 1620",
        "M 24 40 C 60 340, 480 300, 220 600 S 580 780, 300 1080 S 660 1260, 380 1580",
        "M 24 40 C 140 260, 360 420, 120 720 S 460 900, 200 1200 S 540 1380, 280 1700",
        "M 24 40 C 40 380, 540 260, 280 560 S 640 740, 360 1040 S 720 1220, 440 1540",
      ],
    },
  ];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 800 2000"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <linearGradient id="flow-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.19 350)" />
          <stop offset="50%" stopColor="oklch(0.62 0.22 300)" />
          <stop offset="100%" stopColor="oklch(0.6 0.18 250)" />
        </linearGradient>
        <linearGradient id="flow-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.2 280)" />
          <stop offset="55%" stopColor="oklch(0.7 0.17 330)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 230)" />
        </linearGradient>
        <linearGradient id="flow-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.6 0.18 250)" />
          <stop offset="50%" stopColor="oklch(0.68 0.21 310)" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 20)" />
        </linearGradient>
      </defs>
      {groups.map((group, gi) => (
        <g key={gi} opacity={group.opacity}>
          {group.paths.map((d, pi) => (
            <path
              key={pi}
              d={d}
              fill="none"
              stroke={`url(#${group.gradient})`}
              strokeWidth={group.widths[pi % group.widths.length]}
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0; ${(gi + 1) * 18 - 30} ${10 + pi * 6}; 0 0`}
                dur={`${group.duration + pi * 4}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>
      ))}
    </svg>
  );
}

type Notification = { id: string; title: string; detail: string; tone: "stock" | "bill" };

const initialNotifications: Notification[] = [
  { id: "n1", title: "Estoque crítico", detail: "Lâminas descartáveis: apenas 3 un. restantes.", tone: "stock" },
  { id: "n2", title: "Estoque baixo", detail: "Óleo para barba: apenas 6 un. restantes.", tone: "stock" },
  { id: "n3", title: "Despesa a pagar", detail: "Aluguel — vence dia 05/10.", tone: "bill" },
  { id: "n4", title: "Despesa a pagar", detail: "Conta de luz — vence dia 08/10.", tone: "bill" },
  { id: "n5", title: "Despesa a pagar", detail: "Conta de água — vence dia 10/10.", tone: "bill" },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative">
      <button
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
        className="glass-strong relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground shadow-soft transition hover:text-foreground"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground shadow-soft" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="glass-strong animate-float-in absolute right-0 z-50 mt-2 w-[min(88vw,20rem)] overflow-hidden rounded-2xl border border-border shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notificações</p>
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">{notifications.length}</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">Tudo em dia por aqui.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.tone === "stock" ? "bg-chart-1/15 text-chart-1" : "bg-destructive/15 text-destructive"}`}>
                      {n.tone === "stock" ? <Boxes size={15} /> : <CircleDollarSign size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.detail}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                    >
                      Apagar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type ChatMessage = { from: "user" | "bot"; text: string; pro?: boolean };

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function getBotReply(input: string, financeiro: ReturnType<typeof useFinanceiro>, agenda?: ReturnType<typeof useDashboard>): ChatMessage {
  const text = normalize(input);
  const asksForAction =
    /\b(cadastr|cri|adicion|inclu|inser|registr|apag|exclu|remov|alter|edit|atualiz|marc|agend|lanc)\w*/.test(
      text,
    );

  if (asksForAction) {
    return {
      from: "bot",
      pro: true,
      text: "Ações pelo chat, como criar cadastros, adicionar funcionários, alterar o estoque ou fazer agendamentos, estão disponíveis apenas na versão Pro.",
    };
  }
  if (/\b(ganho|ganhos|faturamento|receita|entrada|entradas|saldo|carteira)\b/.test(text)) {
    return {
      from: "bot",
      text: `Os ganhos de hoje são **${formatBRL(financeiro.ganhosHoje)}**. A carteira tem **${formatBRL(financeiro.saldo)}** de saldo, com **${formatBRL(financeiro.entradas)}** em entradas registradas.`,
    };
  }
  if (/\b(perda|perdas|perca|percas|saida|saidas|despesa|despesas|gasto|gastos)\b/.test(text)) {
    return {
      from: "bot",
      text: `As despesas registradas somam **${formatBRL(financeiro.saidas)}**.`,
    };
  }
  if (/\b(estoque|produto|produtos|insumo|insumos|baixo|acabando)\b/.test(text)) {
    return {
      from: "bot",
      text: "O estoque tem **6 produtos cadastrados**. Os itens em nível crítico são **lâminas descartáveis (3 un.)** e **óleo para barba (6 un.)**.",
    };
  }
  if (
    /\b(agenda|agendas|agendamento|agendamentos|horario|horarios|cliente|clientes)\b/.test(text)
  ) {
    return {
      from: "bot",
      text: agenda ? `Há **${agenda.agendamentosHoje} agendamentos hoje**, **${agenda.atendidos} clientes atendidos** e **${agenda.aguardando} aguardando**.${agenda.proximo?.agendado_em ? ` Próximo horário: **${horaReserva(agenda.proximo.agendado_em)}**, ${agenda.proximo.nome}, ${agenda.proximo.servico || "serviço não informado"}.` : " Não há reserva futura."}` : "Consulte a dashboard para ver a agenda atual da fila online.",
    };
  }
  if (
    /\b(metrica|metricas|resumo|resultado|resultados|desempenho|indicador|indicadores)\b/.test(text)
  ) {
    return {
      from: "bot",
      text: `**Financeiro:** ganhos de hoje de ${formatBRL(financeiro.ganhosHoje)} e saldo de ${formatBRL(financeiro.saldo)}.${agenda ? ` A agenda tem ${agenda.agendamentosHoje} reservas hoje e ${agenda.aguardando} clientes aguardando.` : " Consulte a dashboard para a agenda atual."}`,
    };
  }
  return {
    from: "bot",
    text: "Posso consultar **métricas, ganhos, perdas, estoque e agenda**. Pergunte, por exemplo: “Como está o estoque?” ou “Qual é o faturamento de hoje?”.",
  };
}

function DashboardChat() {
  const agenda = useDashboard();
  return <ChatWidgetContent agenda={agenda} />;
}
function ChatWidget() {
  const dashboard = useRouterState({ select: (s) => s.location.pathname === "/dashboard" });
  return dashboard ? <DashboardChat /> : <ChatWidgetContent />;
}
function ChatWidgetContent({ agenda }: { agenda?: ReturnType<typeof useDashboard> }) {
  const financeiro = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Olá, Vanio! Posso ajudar com **métricas, ganhos, perdas, estoque e agenda**. O que você quer saber?",
    },
  ]);

  const send = ({ text: value }: { text: string }) => {
    const text = value.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "user", text }, getBotReply(text, financeiro, agenda)]);
  };

  return (
    <>
      <button
        aria-label="Abrir chat"
        onClick={() => setOpen((v) => !v)}
        className="liquid-button bg-gradient-brand fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-glow transition hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="glass-strong animate-float-in fixed bottom-24 right-6 z-50 flex h-[30rem] w-[min(92vw,23rem)] flex-col overflow-hidden rounded-2xl border border-border shadow-soft">
          <div className="bg-gradient-brand flex items-center gap-3 px-4 py-3 text-primary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-glass/25">
              <Scissors size={17} />
            </div>
            <div>
              <p className="text-sm font-semibold">Assistente Black Studio</p>
              <p className="text-xs opacity-80">Online agora</p>
            </div>
          </div>
          <Conversation>
            <ConversationContent className="gap-3 p-4">
              {messages.map((message, index) => (
                <Message
                  key={`${message.from}-${index}`}
                  from={message.from === "bot" ? "assistant" : "user"}
                >
                  <MessageContent
                    className={
                      message.pro
                        ? "w-full rounded-lg border border-pro-border bg-pro px-3.5 py-3 text-pro-foreground"
                        : message.from === "user"
                          ? "bg-gradient-brand rounded-2xl px-3.5 py-2 text-primary-foreground"
                          : "px-0 py-1"
                    }
                  >
                    {message.pro && (
                      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase">
                        <Crown size={15} aria-hidden="true" /> Recurso Pro
                      </div>
                    )}
                    <MessageResponse>{message.text}</MessageResponse>
                  </MessageContent>
                </Message>
              ))}
            </ConversationContent>
            <ConversationScrollButton aria-label="Ir para a mensagem mais recente" />
          </Conversation>
          <div className="border-t border-border p-3">
            <PromptInput onSubmit={send} className="border-border bg-background/60">
              <PromptInputTextarea
                autoFocus
                placeholder="Pergunte sobre sua barbearia..."
                className="min-h-12 py-2.5"
              />
              <PromptInputFooter className="justify-end py-2">
                <PromptInputSubmit
                  aria-label="Enviar mensagem"
                  className="bg-gradient-brand text-primary-foreground"
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  action,
  showHighlights = false,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  showHighlights?: boolean;
}) {
  return (
    <div className="mt-10">
      {showHighlights && <BarberNews>
        <div className="grid min-w-0 items-start gap-4 py-1 text-foreground min-[560px]:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[256px_minmax(0,1fr)]">
        <div className="w-full max-w-64">

          <a
            href="https://business.google.com"
            target="_blank"
            rel="noreferrer"
            className="glass-strong block rounded-lg border border-border p-2.5 shadow-soft transition hover:border-chart-1/50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <img
                src={googleG.url}
                alt="Google"
                className="h-7 w-7 shrink-0 rounded-lg bg-background object-contain p-1"
              />
              <p className="min-w-0 text-xs font-semibold">Google Meu Negócio</p>
              <ArrowUpRight
                size={16}
                className="ml-auto shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div
              className="mt-1.5 flex flex-wrap items-center gap-1"
              aria-label="Google Meu Negócio"
            >
              <span className="text-xs text-muted-foreground">Perfil da barbearia</span>
            </div>
          </a>

        </div>
        <IndicadoresCarousel />
        </div>
      </BarberNews>}

      <div className="animate-float-in flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{eyebrow}</p>
          <h1 className="text-gradient-brand mt-1 text-4xl font-semibold sm:text-5xl">{title}</h1>
        </div>
        {action}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className="bg-gradient-brand inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-primary-foreground shadow-glow transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

export function StatGrid({
  items,
}: {
  items: {
    label: string;
    value: string;
    note: string;
    icon: LucideIcon;
    tone: string;
    fill: string;
  }[];
}) {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => (
        <article
          key={item.label}
          className="glass-panel animate-float-in rounded-lg border border-border p-5 shadow-soft"
          style={{ animationDelay: `${100 + i * 70}ms` }}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.fill} ${item.tone}`}
          >
            <item.icon size={19} />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{item.label}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <strong className="text-2xl font-semibold">{item.value}</strong>
            <span className="text-xs font-medium text-muted-foreground">{item.note}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export type StatItem = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: string;
  fill: string;
};

export function StatCard({ item, index = 0, color }: { item: StatItem; index?: number; color?: "earnings" | "income" | "expenses" }) {
  const surfaces = {
    earnings: "glass-panel border-border",
    income: "glass-panel border-border",
    expenses: "glass-panel border-border",
  };
  return (
    <article
      className={`animate-float-in rounded-lg border p-5 shadow-soft ${color ? surfaces[color] : "glass-panel border-border"}`}
      style={{ animationDelay: `${100 + index * 70}ms` }}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.fill} ${item.tone}`}
      >
        <item.icon size={19} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{item.label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <strong className="text-2xl font-semibold">{item.value}</strong>
        <span className="text-xs font-medium text-muted-foreground">{item.note}</span>
      </div>
    </article>
  );
}

export function StatCombo({
  items,
  className = "",
}: {
  items: StatItem[];
  className?: string;
}) {
  return (
    <article
      className={`bg-gradient-stat animate-float-in rounded-lg border border-stat-blue-border p-5 shadow-soft sm:p-6 ${className}`}
    >
      <div className="grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-stat-blue-border">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 sm:px-5 ${
              i === 0 ? "sm:pl-0" : ""
            } ${i === items.length - 1 ? "sm:pr-0" : ""}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.fill} ${item.tone}`}
            >
              <item.icon size={19} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-stat-blue-muted">
                {item.label}
              </p>
              <div className="mt-0.5 flex items-end justify-between gap-2">
                <strong className="text-2xl font-semibold text-stat-blue-foreground">{item.value}</strong>
                <span className="text-xs font-medium text-stat-blue-muted">{item.note}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass-panel animate-float-in rounded-lg border border-border p-5 shadow-soft sm:p-6 ${className}`}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Black Studio` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Black Studio` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}

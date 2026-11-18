import { diaSaoPaulo } from "./fila-horarios";
import type { Lancamento } from "./financeiro";

export type RegistroFila = { id: string; nome: string; servico: string | null; status: string; criado_em: string; agendado_em: string | null };
export function resumoAgenda(clientes: RegistroFila[], agora = new Date()) {
  const ativos = clientes.filter((c) => c.status === "aguardando" || c.status === "atendendo");
  const agenda = ativos.filter((c) => c.agendado_em).sort((a, b) => (a.agendado_em ?? "").localeCompare(b.agendado_em ?? ""));
  return {
    agenda,
    agendamentosHoje: agenda.filter((c) => c.agendado_em && diaSaoPaulo(new Date(c.agendado_em)) === diaSaoPaulo(agora)).length,
    atendidos: clientes.filter((c) => c.status === "concluido").length,
    aguardando: ativos.filter((c) => c.status === "aguardando").length,
    proximo: agenda.find((c) => c.agendado_em && Date.parse(c.agendado_em) >= agora.getTime()) ?? null,
  };
}
export function desempenhoReal(clientes: RegistroFila[], lancamentos: Lancamento[], agora = new Date()) {
  const mes = diaSaoPaulo(agora).slice(0, 7);
  const dias = Array.from({ length: 31 }, () => 0);
  for (const l of lancamentos) {
    const dia = diaSaoPaulo(new Date(l.criadoEm));
    if (dia.startsWith(mes)) dias[Number(dia.slice(8)) - 1] += l.tipo === "entrada" ? l.valor : -l.valor;
  }
  const contagem = new Map<string, number>();
  for (const c of clientes) if (c.status === "concluido" && c.servico) contagem.set(c.servico, (contagem.get(c.servico) ?? 0) + 1);
  return { dias, saldoMes: dias.reduce((a, b) => a + b, 0), servicos: [...contagem].sort((a, b) => b[1] - a[1]) };
}
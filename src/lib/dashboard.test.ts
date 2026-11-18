import { expect, it } from "vitest";
import { resumoAgenda, desempenhoReal, type RegistroFila } from "./dashboard";
const agora = new Date("2026-11-18T12:00:00Z");
const registro = (id: string, status: string, inicio: string | null): RegistroFila => ({ id, status, agendado_em: inicio, nome: id, servico: "Corte + Barba", criado_em: "2026-11-18T10:00:00Z" });
it("usa as reservas ativas da fila, ordena a agenda e exclui cancelados e concluídos", () => {
  const r = resumoAgenda([registro("tarde", "aguardando", "2026-11-18T17:30:00Z"), registro("amanha", "aguardando", "2026-11-19T12:00:00Z"), registro("cancelado", "cancelado", "2026-11-18T13:00:00Z"), registro("atendido", "concluido", null), registro("fila", "aguardando", null)], agora);
  expect(r.agenda.map((c) => c.id)).toEqual(["tarde", "amanha"]);
  expect(r.agendamentosHoje).toBe(1);
  expect(r.atendidos).toBe(1);
  expect(r.aguardando).toBe(3);
  expect(r.proximo?.id).toBe("tarde");
});
it("não inventa próximo horário quando não há reserva futura", () => {
  expect(resumoAgenda([registro("passado", "aguardando", "2026-11-18T11:00:00Z")], agora).proximo).toBeNull();
});
it("calcula desempenho apenas com lançamentos reais e serviços concluídos", () => {
  const r = desempenhoReal([registro("feito", "concluido", null), registro("pendente", "aguardando", null)], [{ id: "1", descricao: "Corte", valor: 80, tipo: "entrada", criadoEm: "2026-11-18T12:00:00Z" }, { id: "2", descricao: "Despesa", valor: 20, tipo: "saida", criadoEm: "2026-11-18T12:00:00Z" }], agora);
  expect(r.saldoMes).toBe(60);
  expect(r.dias[17]).toBe(60);
  expect(r.servicos).toEqual([["Corte + Barba", 1]]);
});
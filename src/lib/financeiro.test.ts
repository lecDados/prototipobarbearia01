import { describe, expect, it } from "vitest";
import { lancamentosDaFila, lerLancamentos, resumoFinanceiro, valorLancamento, type Lancamento, type AtendimentoFinanceiro } from "./financeiro";
import { precoServico } from "./servicos";

const corte: Lancamento = { id: "1", descricao: "Corte", valor: 45, tipo: "entrada", criadoEm: "2026-11-13T12:00:00" };
describe("lançamentos e ganhos", () => {
  it("soma um serviço aos ganhos e ao saldo imediatamente", () => {
    expect(resumoFinanceiro([corte], new Date("2026-11-13T15:00:00"))).toEqual({ entradas: 45, saidas: 0, saldo: 45, ganhosHoje: 45 });
  });
  it("desconta despesas do saldo sem reduzir a receita de serviços", () => {
    expect(resumoFinanceiro([corte, { ...corte, id: "2", tipo: "saida", valor: 20 }], new Date(corte.criadoEm))).toEqual({ entradas: 45, saidas: 20, saldo: 25, ganhosHoje: 45 });
  });
  it("conta nos ganhos de hoje apenas serviços do dia", () => {
    expect(resumoFinanceiro([corte], new Date("2026-11-14T12:00:00")).ganhosHoje).toBe(0);
  });
  it("restaura os valores salvos sem acrescentar ganhos demonstrativos", () => {
    expect(lerLancamentos(JSON.stringify([corte]))).toEqual([corte]);
    expect(resumoFinanceiro([]).saldo).toBe(0);
  });
  it("aceita centavos e rejeita valores inválidos", () => {
    expect(valorLancamento("45,50")).toBe(45.5);
    for (const valor of ["", "0", "-1", "abc", "Infinity"]) expect(valorLancamento(valor)).toBeNull();
  });
});

const atendimento: AtendimentoFinanceiro = { id: "fila-1", nome: "Cliente", servico: "Corte + Barba", status: "concluido", valor_atendimento: 80, concluido_em: "2026-11-21T12:00:00Z", lancamento_excluido: false };
describe("carteira dos atendimentos da fila", () => {
  it("acrescenta o preço do serviço concluído à carteira", () => {
    expect(precoServico("Corte + Barba")).toBe(80);
    const registros = lancamentosDaFila([atendimento]);
    expect(registros).toEqual([{ id: "fila-1", descricao: "Corte + Barba — Cliente", valor: 80, tipo: "entrada", criadoEm: "2026-11-21T12:00:00Z" }]);
    expect(resumoFinanceiro(registros).saldo).toBe(80);
  });
  it("não credita clientes aguardando ou em atendimento", () => {
    expect(lancamentosDaFila([{ ...atendimento, status: "aguardando" }, { ...atendimento, status: "atendendo" }])).toEqual([]);
  });
  it("excluir o lançamento retira seu valor sem mudar a conclusão", () => {
    const excluido = { ...atendimento, lancamento_excluido: true };
    expect(resumoFinanceiro(lancamentosDaFila([excluido])).saldo).toBe(0);
    expect(excluido.status).toBe("concluido");
  });
  it("mantém o valor registrado mesmo se o preço do catálogo mudar", () => {
    expect(lancamentosDaFila([{ ...atendimento, valor_atendimento: 75 }])[0]?.valor).toBe(75);
  });
  it("não inventa valores para conclusões antigas ou serviços desconhecidos", () => {
    expect(lancamentosDaFila([{ ...atendimento, valor_atendimento: null, concluido_em: null }])).toEqual([]);
    expect(precoServico(null)).toBeNull();
    expect(precoServico("Desconhecido")).toBeNull();
  });
});
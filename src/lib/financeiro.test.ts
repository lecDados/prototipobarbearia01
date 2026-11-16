import { describe, expect, it } from "vitest";
import { lerLancamentos, resumoFinanceiro, valorLancamento, type Lancamento } from "./financeiro";

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
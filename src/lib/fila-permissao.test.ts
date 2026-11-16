import { describe, expect, it } from "vitest";
import { donoDaFila, novaBarbearia } from "./fila-permissao";

describe("acesso do barbeiro sem PIN", () => {
  it("permite ao dono autenticado gerenciar sua fila", () => {
    expect(donoDaFila("barbeiro-a", "barbeiro-a")).toBe(true);
  });
  it("não concede controles a clientes ou a outro barbeiro", () => {
    expect(donoDaFila("cliente-b", "barbeiro-a")).toBe(false);
    expect(donoDaFila("", "barbeiro-a")).toBe(false);
  });
  it("vincula a nova fila apenas à identidade autenticada", () => {
    expect(novaBarbearia("barbeiro-a")).toEqual({ owner_id: "barbeiro-a", slug: "barbearia-barbeiro-a" });
    expect(novaBarbearia("barbeiro-b").slug).not.toBe(novaBarbearia("barbeiro-a").slug);
  });
  it("não cria fila sem uma conta autenticada", () => {
    expect(() => novaBarbearia("")).toThrow();
  });
});
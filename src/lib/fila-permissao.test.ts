import { describe, expect, it } from "vitest";
import { donoDaFila } from "./fila-permissao";

describe("acesso do barbeiro sem PIN", () => {
  it("permite ao dono autenticado gerenciar sua fila", () => {
    expect(donoDaFila("barbeiro-a", "barbeiro-a")).toBe(true);
  });
  it("não concede controles a clientes ou a outro barbeiro", () => {
    expect(donoDaFila("cliente-b", "barbeiro-a")).toBe(false);
    expect(donoDaFila("", "barbeiro-a")).toBe(false);
  });
});
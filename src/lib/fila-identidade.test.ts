import { describe, expect, it } from "vitest";
import { identidadeFila, chaveProgresso } from "./fila-identidade";

describe("identidade individual da fila", () => {
  it("separa o progresso de clientes diferentes na mesma barbearia", () => {
    expect(chaveProgresso("141c384d", "cliente-a")).not.toBe(chaveProgresso("141c384d", "cliente-b"));
  });
  it("não aceita apenas um ID sem o comprovante privado de entrada", () => {
    expect(identidadeFila({ id: "11111111-1111-1111-1111-111111111111" })).toBeNull();
  });
});
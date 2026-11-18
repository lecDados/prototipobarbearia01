import { describe, expect, it } from "vitest";
import { entradaComServico } from "./fila-servico";

describe("serviço escolhido pelo cliente", () => {
  it("envia o serviço junto com a identidade do cliente", () => {
    expect(entradaComServico("barbearia", "Cliente", "11999999999", "Corte + Barba")).toEqual({ _slug: "barbearia", _nome: "Cliente", _whatsapp: "11999999999", _servico: "Corte + Barba" });
  });
  it("não permite enviar o cadastro sem escolher um serviço", () => {
    expect(() => entradaComServico("barbearia", "Cliente", "11999999999", "")).toThrow("Selecione um serviço válido.");
  });
});
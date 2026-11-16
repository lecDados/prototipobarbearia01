import { expect, it } from "vitest";
import { resumoIndicadores } from "./indicadores";

it("deriva os indicadores dos mesmos registros de contas e estoque", () => {
  expect(resumoIndicadores()).toEqual({ contasAbertas: 3, valorContas: 4540, estoqueBaixo: 1, produtos: 6 });
});
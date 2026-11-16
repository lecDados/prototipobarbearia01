import { describe, expect, it } from "vitest";
import { progressoEspera } from "./fila-tempo";

describe("contagem de espera da fila", () => {
  it("diminui o tempo e a barra conforme passam os minutos", () => {
    expect(progressoEspera(0, 30, 15 * 60_000)).toEqual({ minutos: 15, percentual: 50 });
    expect(progressoEspera(0, 30, 16 * 60_000).minutos).toBe(14);
  });
  it("para em zero quando a estimativa acaba", () => {
    expect(progressoEspera(0, 30, 40 * 60_000)).toEqual({ minutos: 0, percentual: 0 });
  });
});
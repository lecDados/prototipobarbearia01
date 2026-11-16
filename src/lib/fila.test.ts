import { describe, expect, it } from "vitest";
import { tempoEstimado } from "./fila";

describe("tempoEstimado", () => {
  it("posição × 30 min por padrão", () => {
    expect(tempoEstimado(3, 30)).toBe(90);
  });
  it("respeita valor configurado", () => {
    expect(tempoEstimado(2, 45)).toBe(90);
  });
});

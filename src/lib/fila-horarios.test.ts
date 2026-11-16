import { describe, expect, it } from "vitest";
import { diaSaoPaulo, horaReserva, reservaDisponivel } from "./fila-horarios";

describe("reserva opcional", () => {
  it("permite escolher 14:30 quando está livre", () => {
    const inicio = "2026-11-17T17:30:00+00:00";
    expect(horaReserva(inicio)).toBe("14:30");
    expect(reservaDisponivel([{ inicio, disponivel: true }], inicio)).toBe(true);
  });
  it("não permite escolher horário ocupado", () => {
    expect(reservaDisponivel([{ inicio: "14:30", disponivel: false }], "14:30")).toBe(false);
  });
  it("não permite confirmar sem escolher horário", () => {
    expect(reservaDisponivel([{ inicio: "14:30", disponivel: true }], "")).toBe(false);
  });
  it("usa o dia da barbearia, não o UTC", () => {
    expect(diaSaoPaulo(new Date("2026-11-17T01:00:00Z"))).toBe("2026-11-16");
  });
});
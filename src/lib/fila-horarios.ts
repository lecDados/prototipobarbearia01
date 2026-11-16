export type HorarioFila = { inicio: string; disponivel: boolean };
export function diaSaoPaulo(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function horaReserva(inicio: string) {
  return new Date(inicio).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
}
export function reservaDisponivel(horarios: HorarioFila[], inicio: string) {
  return horarios.some((h) => h.inicio === inicio && h.disponivel);
}
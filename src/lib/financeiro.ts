export type Lancamento = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  criadoEm: string;
};

export const formatBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function valorLancamento(texto: string): number | null {
  const valor = Number(texto.trim().replace(",", "."));
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) / 100 : null;
}

export function resumoFinanceiro(lancamentos: Lancamento[], agora = new Date()) {
  let entradas = 0;
  let saidas = 0;
  let ganhosHoje = 0;
  for (const item of lancamentos) {
    if (item.tipo === "saida") saidas += item.valor;
    else {
      entradas += item.valor;
      if (new Date(item.criadoEm).toDateString() === agora.toDateString()) ganhosHoje += item.valor;
    }
  }
  return { entradas, saidas, saldo: entradas - saidas, ganhosHoje };
}

export function lerLancamentos(texto: string | null): Lancamento[] {
  try {
    const dados: unknown = JSON.parse(texto ?? "[]");
    if (!Array.isArray(dados)) return [];
    return dados.filter((item): item is Lancamento =>
      typeof item === "object" && item !== null &&
      typeof item.id === "string" && typeof item.descricao === "string" &&
      typeof item.valor === "number" && Number.isFinite(item.valor) && item.valor > 0 &&
      (item.tipo === "entrada" || item.tipo === "saida") &&
      typeof item.criadoEm === "string" && Number.isFinite(Date.parse(item.criadoEm)),
    );
  } catch { return []; }
}
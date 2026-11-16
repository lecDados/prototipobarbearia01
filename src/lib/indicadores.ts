export const bills = [
  { name: "Aluguel do salão", due: "05 out", value: "R$ 3.200", status: "Pendente" },
  { name: "Energia elétrica", due: "28 set", value: "R$ 380", status: "Vencendo" },
  { name: "Internet", due: "20 set", value: "R$ 120", status: "Paga" },
  { name: "Fornecedor de produtos", due: "02 out", value: "R$ 960", status: "Pendente" },
  { name: "Água", due: "15 set", value: "R$ 90", status: "Paga" },
];

export const items = [
  { name: "Pomada modeladora", qty: 24, max: 30, price: "R$ 35" },
  { name: "Óleo para barba", qty: 6, max: 20, price: "R$ 42" },
  { name: "Shampoo profissional", qty: 14, max: 20, price: "R$ 28" },
  { name: "Lâminas descartáveis", qty: 3, max: 50, price: "R$ 1,50" },
  { name: "Toalhas", qty: 40, max: 50, price: "R$ 12" },
  { name: "Pós-barba", qty: 11, max: 20, price: "R$ 30" },
];

export function resumoIndicadores() {
  const abertas = bills.filter((bill) => bill.status !== "Paga");
  return {
    contasAbertas: abertas.length,
    valorContas: abertas.reduce((total, bill) => total + Number(bill.value.replace(/[^\d,]/g, "").replace(",", ".")), 0),
    estoqueBaixo: items.filter((item) => Math.round((item.qty / item.max) * 100) < 30).length,
    produtos: items.length,
  };
}
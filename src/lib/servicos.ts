export type Service = {
  name: string;
  price: string;
  time: string;
  cat: string;
  tone: string;
};

export const initialServices: Service[] = [
  { name: "Corte clássico", price: "R$ 45", time: "30 min", cat: "Cabelo", tone: "bg-primary" },
  { name: "Degradê", price: "R$ 55", time: "40 min", cat: "Cabelo", tone: "bg-chart-3" },
  { name: "Barba premium", price: "R$ 40", time: "30 min", cat: "Barba", tone: "bg-chart-1" },
  { name: "Corte + Barba", price: "R$ 80", time: "60 min", cat: "Combo", tone: "bg-success" },
  { name: "Corte executivo", price: "R$ 65", time: "45 min", cat: "Cabelo", tone: "bg-chart-2" },
  { name: "Sobrancelha", price: "R$ 20", time: "15 min", cat: "Acabamento", tone: "bg-accent" },
];
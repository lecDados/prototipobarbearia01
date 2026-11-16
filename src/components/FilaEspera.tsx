import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";
import { formatMinutos } from "@/lib/fila";
import { progressoEspera } from "@/lib/fila-tempo";

type Referencia = { assinatura: string; inicio: number };

export function FilaEspera({ chave, assinatura, minutos }: { chave: string; assinatura: string; minutos: number }) {
  const [referencia, setReferencia] = useState<Referencia | null>(null);
  const [agora, setAgora] = useState(0);

  useEffect(() => {
    let salva: Referencia | null = null;
    try {
      const valor = JSON.parse(localStorage.getItem(`${chave}:tempo`) ?? "null");
      if (valor?.assinatura === assinatura && typeof valor.inicio === "number" && Number.isFinite(valor.inicio)) salva = valor;
    } catch { /* Uma referência inválida começa uma nova estimativa. */ }
    const atual = salva ?? { assinatura, inicio: Date.now() };
    localStorage.setItem(`${chave}:tempo`, JSON.stringify(atual));
    setReferencia(atual);
    setAgora(Date.now());
    const timer = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [chave, assinatura]);

  const progresso = referencia?.assinatura === assinatura
    ? progressoEspera(referencia.inicio, minutos, agora)
    : { minutos, percentual: 100 };

  return (
    <div className="mt-4 border-t border-glass/30 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>Espera estimada</span>
        <strong>{progresso.minutos > 0 ? `~${formatMinutos(progresso.minutos)}` : "Aguardando chamada"}</strong>
      </div>
      <div className="mx-4 mt-5 mb-4 relative h-2 rounded-full bg-glass/25" role="progressbar" aria-label="Tempo estimado restante" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progresso.percentual)} aria-valuetext={`${progresso.minutos} minutos restantes`}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary-foreground transition-[width] duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${progresso.percentual}%` }} />
        <span className="absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-soft transition-[left] duration-1000 ease-linear motion-reduce:transition-none" style={{ left: `${progresso.percentual}%` }}>
          <Scissors size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="text-xs opacity-80">{progresso.minutos > 0 ? "O tempo pode variar conforme os atendimentos." : "A estimativa terminou. Aguarde o barbeiro chamar."}</p>
    </div>
  );
}
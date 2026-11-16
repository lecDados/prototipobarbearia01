import { useEffect, useState } from "react";
import { Boxes, CircleDollarSign, PackageSearch, WalletCards } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { resumoIndicadores } from "@/lib/indicadores";
import { formatBRL } from "@/lib/financeiro";
import { useFinanceiro } from "@/hooks/use-financeiro";

export function IndicadoresCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const { saldo } = useFinanceiro();
  const resumo = resumoIndicadores();
  const indicadores = [
    { label: "Contas a pagar", value: formatBRL(resumo.valorContas), detail: `${resumo.contasAbertas} contas em aberto`, Icon: CircleDollarSign, tone: "border-pro-border/40 bg-pro/15", accent: "text-highlight" },
    { label: "Estoque baixo", value: String(resumo.estoqueBaixo).padStart(2, "0"), detail: "Produtos para repor", Icon: PackageSearch, tone: "border-chart-1/30 bg-chart-1/10", accent: "text-chart-1" },
    { label: "Produtos cadastrados", value: String(resumo.produtos).padStart(2, "0"), detail: "Itens no catálogo de estoque", Icon: Boxes, tone: "border-success/30 bg-success/10", accent: "text-success" },
    { label: "Saldo da carteira", value: formatBRL(saldo), detail: "Lançamentos registrados", Icon: WalletCards, tone: "border-queue-action/40 bg-queue-action/15", accent: "text-surface-dark-foreground" },
  ];

  useEffect(() => {
    if (!api || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), 6000);
    return () => window.clearInterval(timer);
  }, [api, paused]);

  return (
    <Carousel
      aria-label="Indicadores da barbearia"
      opts={{ align: "start", loop: true }}
      setApi={setApi}
      className="min-w-0 text-surface-dark-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <CarouselContent className="-ml-2">
        {indicadores.map(({ label, value, detail, Icon, tone, accent }) => (
          <CarouselItem key={label} className="basis-full pl-2 xl:basis-1/2">
            <article className={`flex h-28 min-w-0 flex-col justify-between rounded-lg border p-3 ${tone}`}>
              <div className="flex items-center gap-2">
                <Icon size={15} className={`shrink-0 ${accent}`} aria-hidden="true" />
                <p className="text-xs font-medium">{label}</p>
              </div>
              <strong className="text-xl font-semibold tabular-nums">{value}</strong>
              <p className="text-xs text-surface-dark-muted">{detail}</p>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-2 flex justify-end gap-1.5">
        <CarouselPrevious aria-label="Indicador anterior" title="Indicador anterior" className="static h-7 w-7 translate-y-0 border-surface-dark-border bg-surface-dark-hover text-surface-dark-foreground hover:bg-surface-dark-hover hover:text-surface-dark-foreground" />
        <CarouselNext aria-label="Próximo indicador" title="Próximo indicador" className="static h-7 w-7 translate-y-0 border-surface-dark-border bg-surface-dark-hover text-surface-dark-foreground hover:bg-surface-dark-hover hover:text-surface-dark-foreground" />
      </div>
    </Carousel>
  );
}
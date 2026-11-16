import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Tempo estimado em minutos: posição × minutos por cliente. */
export function tempoEstimado(posicao: number, minutosPorCliente: number) {
  return Math.max(0, posicao) * minutosPorCliente;
}

export function formatMinutos(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

/** Escuta o aviso público da fila e chama onChange a cada mudança. */
export function useFilaRealtime(slug: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!slug) return;
    const channel = supabase
      .channel(`fila-${slug}`)
      .on("broadcast", { event: "mudou" }, () => onChange())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
}

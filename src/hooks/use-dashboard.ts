import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { dadosDashboard } from "@/lib/fila-painel.functions";
import { resumoAgenda } from "@/lib/dashboard";
import { useFilaRealtime } from "@/lib/fila";

export const dashboardQuery = queryOptions({ queryKey: ["dashboard-fila"], queryFn: () => dadosDashboard(), refetchInterval: 10000, staleTime: 0 });
export function useDashboard() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const client = useQueryClient();
  const atualizar = useCallback(() => { void client.invalidateQueries({ queryKey: dashboardQuery.queryKey }); }, [client]);
  useFilaRealtime(data.slug ?? undefined, atualizar);
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setAgora(new Date()), 30000); return () => clearInterval(timer); }, []);
  return { ...resumoAgenda(data.clientes, agora), clientes: data.clientes, agora };
}
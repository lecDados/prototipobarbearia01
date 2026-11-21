import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resumoFinanceiro } from "@/lib/financeiro";
import { excluirLancamento, lerCarteira } from "@/lib/financeiro.functions";

export function useFinanceiro() {
  const [hidratado, setHidratado] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const client = useQueryClient();
  const ler = useServerFn(lerCarteira);
  const excluir = useServerFn(excluirLancamento);
  useEffect(() => setHidratado(true), []);
  const conta = useQuery({
    queryKey: ["financeiro-conta"], enabled: hidratado,
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user?.id ?? null; },
  });
  const carteira = useQuery({
    queryKey: ["financeiro-fila", conta.data],
    queryFn: () => ler(), enabled: hidratado && !!conta.data,
    refetchInterval: 10000, staleTime: 0,
  });
  const lancamentos = conta.data ? carteira.data ?? [] : [];
  async function remover(id: string) {
    setExcluindo(id);
    setErroExclusao("");
    try {
      await excluir({ data: { id } });
      await client.invalidateQueries({ queryKey: ["financeiro-fila"] });
      return true;
    } catch {
      setErroExclusao("Não foi possível excluir o lançamento. Tente novamente.");
      return false;
    } finally { setExcluindo(null); }
  }
  const pronto = hidratado && !conta.isPending && (!conta.data || !carteira.isPending);
  const erro = erroExclusao || (carteira.isError ? "Não foi possível carregar os lançamentos da fila." : "");
  return { lancamentos, pronto, erro, remover, excluindo, ...resumoFinanceiro(lancamentos) };
}

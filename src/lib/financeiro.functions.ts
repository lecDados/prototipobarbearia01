import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lancamentosDaFila } from "./financeiro";

export const lerCarteira = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store");
    const { data, error } = await context.supabase.from("fila")
      .select("id,nome,servico,status,valor_atendimento,concluido_em,lancamento_excluido")
      .eq("status", "concluido").eq("lancamento_excluido", false)
      .order("concluido_em", { ascending: false });
    if (error) throw new Error("Não foi possível carregar a carteira.");
    return lancamentosDaFila(data ?? []);
  });

export const excluirLancamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: registros, error } = await context.supabase.from("fila")
      .update({ lancamento_excluido: true }).eq("id", data.id)
      .eq("status", "concluido").select("id");
    if (error || !registros?.length) throw new Error("Não foi possível excluir o lançamento.");
    return { ok: true };
  });
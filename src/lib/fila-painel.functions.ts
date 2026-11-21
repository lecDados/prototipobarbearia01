import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { donoDaFila, novaBarbearia } from "./fila-permissao";
import { precoServico } from "./servicos";

export const dadosDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store");
    const { data: barb, error: erroBarb } = await context.supabase.from("barbearias").select("id,slug").eq("owner_id", context.userId).maybeSingle();
    if (erroBarb) throw new Error("Não foi possível carregar a agenda.");
    if (!barb) return { slug: null, clientes: [] };
    const { data, error } = await context.supabase.from("fila").select("id,nome,servico,status,criado_em,agendado_em").eq("barbearia_id", barb.id).order("criado_em");
    if (error) throw new Error("Não foi possível carregar a agenda.");
    return { slug: barb.slug, clientes: data ?? [] };
  });

export const painelFila = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    acao: z.enum(["ler", "status", "configurar"]),
    id: z.string().uuid().optional(),
    status: z.enum(["atendendo", "concluido"]).optional(),
    aberta: z.boolean().optional(),
    minutos: z.number().int().min(5).max(180).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store");
    const { supabase, userId } = context;
    const consultarBarbearia = () => supabase.from("barbearias")
      .select("id,owner_id,slug,fila_aberta,minutos_por_cliente")
      .eq("owner_id", userId).maybeSingle();
    let { data: barb, error: bError } = await consultarBarbearia();
    if (bError) throw new Error("Não foi possível consultar a barbearia.");
    if (!barb) {
      // RLS enforces ownership; concurrent first visits keep the same queue.
      const { error } = await supabase.from("barbearias")
        .upsert(novaBarbearia(userId), { onConflict: "owner_id", ignoreDuplicates: true });
      if (error) throw new Error("Não foi possível preparar a fila desta conta.");
      ({ data: barb, error: bError } = await consultarBarbearia());
    }
    if (bError || !barb || !donoDaFila(userId, barb.owner_id)) throw new Error("Esta conta não tem acesso à fila da barbearia.");
    if (data.acao === "status") {
      if (!data.id || !data.status) throw new Error("Atendimento inválido.");
      if (data.status === "concluido") {
        const { data: cliente, error: erroCliente } = await supabase.from("fila").select("servico").eq("id", data.id).eq("barbearia_id", barb.id).single();
        if (erroCliente || !cliente) throw new Error("Atendimento não encontrado.");
        const valor = precoServico(cliente.servico);
        if (valor === null) throw new Error("O serviço deste atendimento não tem preço no catálogo.");
        const { error } = await supabase.rpc("concluir_atendimento", { _id: data.id, _valor: valor });
        if (error) throw new Error("Não foi possível concluir e registrar o atendimento na carteira.");
      } else {
        const { error } = await supabase.from("fila").update({ status: data.status }).eq("id", data.id).eq("barbearia_id", barb.id).eq("status", "aguardando");
        if (error) throw new Error("Não foi possível atualizar o atendimento.");
      }
    }
    if (data.acao === "configurar") {
      const campos = { ...(data.aberta !== undefined ? { fila_aberta: data.aberta } : {}), ...(data.minutos !== undefined ? { minutos_por_cliente: data.minutos } : {}) };
      const { data: atual, error } = await supabase.from("barbearias").update(campos).eq("id", barb.id).select("fila_aberta,minutos_por_cliente").single();
      if (error || !atual) throw new Error("Não foi possível atualizar a fila.");
      Object.assign(barb, atual);
    }
    const { data: clientes, error } = await supabase.from("fila").select("id,nome,whatsapp,status,criado_em,agendado_em,servico").eq("barbearia_id", barb.id).in("status", ["aguardando", "atendendo"]).order("criado_em");
    if (error) throw new Error("Não foi possível carregar os clientes.");
    return { autorizado: true as const, barb, clientes: clientes ?? [] };
  });
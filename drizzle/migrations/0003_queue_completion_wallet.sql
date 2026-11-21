ALTER TABLE public.fila ADD COLUMN valor_atendimento numeric(12,2) CHECK (valor_atendimento > 0), ADD COLUMN concluido_em timestamptz, ADD COLUMN lancamento_excluido boolean NOT NULL DEFAULT false;
CREATE FUNCTION public.concluir_atendimento(_id uuid, _valor numeric) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE _cliente public.fila;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 SELECT f.* INTO _cliente FROM public.fila f JOIN public.barbearias b ON b.id = f.barbearia_id WHERE f.id = _id AND b.owner_id = auth.uid() FOR UPDATE OF f;
 IF NOT FOUND THEN RAISE EXCEPTION 'Atendimento não encontrado'; END IF;
 IF _cliente.status = 'concluido' THEN RETURN false; END IF;
 IF _cliente.status NOT IN ('aguardando', 'atendendo') THEN RAISE EXCEPTION 'Atendimento indisponível'; END IF;
 IF _valor IS NULL OR _valor <= 0 OR _valor > 9999999999.99 THEN RAISE EXCEPTION 'Valor inválido'; END IF;
 UPDATE public.fila SET status = 'concluido', valor_atendimento = round(_valor, 2), concluido_em = now() WHERE id = _id;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.concluir_atendimento(uuid,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.concluir_atendimento(uuid,numeric) TO authenticated;
GRANT ALL ON FUNCTION public.concluir_atendimento(uuid,numeric) TO service_role;
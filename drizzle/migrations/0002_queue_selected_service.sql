ALTER TABLE public.fila ADD COLUMN servico text;
ALTER TABLE public.fila ADD CONSTRAINT fila_servico_valido CHECK (servico IS NULL OR (length(trim(servico)) BETWEEN 2 AND 60));
CREATE OR REPLACE FUNCTION public.entrar_fila(_slug text, _nome text, _whatsapp text, _servico text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE entrada jsonb;
BEGIN
IF _servico IS NULL OR length(trim(_servico)) NOT BETWEEN 2 AND 60 THEN RAISE EXCEPTION 'Selecione um serviço válido'; END IF;
entrada := public.entrar_fila(_slug, _nome, _whatsapp);
UPDATE public.fila SET servico=trim(_servico) WHERE id=(entrada->>'id')::uuid;
RETURN entrada;
END $$;
REVOKE ALL ON FUNCTION public.entrar_fila(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.entrar_fila(text,text,text,text) TO anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.reservar_fila(_slug text, _nome text, _whatsapp text, _inicio timestamptz, _servico text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE entrada jsonb;
BEGIN
IF _servico IS NULL OR length(trim(_servico)) NOT BETWEEN 2 AND 60 THEN RAISE EXCEPTION 'Selecione um serviço válido'; END IF;
entrada := public.reservar_fila(_slug, _nome, _whatsapp, _inicio);
UPDATE public.fila SET servico=trim(_servico) WHERE id=(entrada->>'id')::uuid;
RETURN entrada;
END $$;
REVOKE ALL ON FUNCTION public.reservar_fila(text,text,text,timestamptz,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reservar_fila(text,text,text,timestamptz,text) TO anon,authenticated,service_role;
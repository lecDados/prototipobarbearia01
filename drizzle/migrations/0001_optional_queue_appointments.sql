ALTER TABLE public.fila ADD COLUMN agendado_em timestamptz;
CREATE UNIQUE INDEX fila_horario_unico ON public.fila (barbearia_id, agendado_em) WHERE agendado_em IS NOT NULL AND status IN ('aguardando','atendendo');
CREATE OR REPLACE FUNCTION public.horarios_fila(_slug text, _dia date) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT coalesce(jsonb_agg(jsonb_build_object('inicio',s.inicio,'disponivel',b.fila_aberta AND s.inicio > now() AND NOT EXISTS(SELECT 1 FROM public.fila f WHERE f.barbearia_id=b.id AND f.agendado_em=s.inicio AND f.status IN ('aguardando','atendendo'))) ORDER BY s.inicio),'[]'::jsonb)
FROM public.barbearias b CROSS JOIN LATERAL generate_series((_dia + time '09:00') AT TIME ZONE 'America/Sao_Paulo',(_dia + time '19:30') AT TIME ZONE 'America/Sao_Paulo',interval '30 minutes') s(inicio)
WHERE b.slug=_slug AND _dia BETWEEN (now() AT TIME ZONE 'America/Sao_Paulo')::date AND (now() AT TIME ZONE 'America/Sao_Paulo')::date + 30;
$$;
CREATE OR REPLACE FUNCTION public.reservar_fila(_slug text,_nome text,_whatsapp text,_inicio timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.barbearias; f public.fila; local_inicio timestamp;
BEGIN
SELECT * INTO b FROM public.barbearias WHERE slug=_slug;
IF NOT FOUND THEN RAISE EXCEPTION 'Barbearia não encontrada'; END IF;
IF NOT b.fila_aberta THEN RAISE EXCEPTION 'A fila está fechada'; END IF;
IF length(trim(_nome)) NOT BETWEEN 2 AND 60 OR _nome IS NULL THEN RAISE EXCEPTION 'Nome inválido'; END IF;
IF length(regexp_replace(_whatsapp,'\D','','g')) NOT BETWEEN 10 AND 13 OR _whatsapp IS NULL THEN RAISE EXCEPTION 'WhatsApp inválido'; END IF;
local_inicio := _inicio AT TIME ZONE 'America/Sao_Paulo';
IF _inicio IS NULL OR _inicio <= now() OR local_inicio::date > (now() AT TIME ZONE 'America/Sao_Paulo')::date + 30 OR local_inicio::time < time '09:00' OR local_inicio::time > time '19:30' OR extract(minute FROM local_inicio) NOT IN (0,30) OR extract(second FROM local_inicio) <> 0 THEN RAISE EXCEPTION 'Escolha um horário disponível entre 9h e 20h'; END IF;
INSERT INTO public.fila(barbearia_id,nome,whatsapp,agendado_em) VALUES(b.id,trim(_nome),regexp_replace(_whatsapp,'\D','','g'),_inicio) RETURNING * INTO f;
RETURN jsonb_build_object('id',f.id,'token',f.token,'inicio',f.agendado_em,'status',f.status);
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'Este horário acabou de ser reservado. Escolha outro.';
END $$;
CREATE OR REPLACE FUNCTION public.fila_agendamento_cliente(_slug text,_id uuid,_token uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT jsonb_build_object('inicio',f.agendado_em,'status',f.status) FROM public.fila f JOIN public.barbearias b ON b.id=f.barbearia_id WHERE b.slug=_slug AND f.id=_id AND f.token=_token AND f.agendado_em IS NOT NULL AND f.status IN ('aguardando','atendendo');
$$;
CREATE OR REPLACE FUNCTION public.fila_publica(_slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT jsonb_build_object('nome',b.nome,'aberta',b.fila_aberta,'minutos',b.minutos_por_cliente,'clientes',coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'nome',split_part(trim(f.nome),' ',1),'status',f.status) ORDER BY f.criado_em) FROM public.fila f WHERE f.barbearia_id=b.id AND f.agendado_em IS NULL AND f.status IN ('aguardando','atendendo')),'[]'::jsonb)) FROM public.barbearias b WHERE b.slug=_slug;
$$;
REVOKE ALL ON FUNCTION public.horarios_fila(text,date),public.reservar_fila(text,text,text,timestamptz),public.fila_agendamento_cliente(text,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.horarios_fila(text,date),public.reservar_fila(text,text,text,timestamptz),public.fila_agendamento_cliente(text,uuid,uuid) TO anon,authenticated,service_role;
GRANT INSERT ON public.barbearias TO authenticated;
CREATE POLICY "Dono cria sua barbearia" ON public.barbearias FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
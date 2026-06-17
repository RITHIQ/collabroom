-- RLS policies for testing environment
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testing allow all" ON public.messages FOR ALL USING (true) WITH CHECK (true);

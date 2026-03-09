
-- New columns for proposals (professional document structure)
ALTER TABLE public.proposals 
  ADD COLUMN IF NOT EXISTS objectives text,
  ADD COLUMN IF NOT EXISTS functional_scope text,
  ADD COLUMN IF NOT EXISTS technologies text,
  ADD COLUMN IF NOT EXISTS hosting text,
  ADD COLUMN IF NOT EXISTS guarantee text,
  ADD COLUMN IF NOT EXISTS project_overview text;

-- proposal_adjustments table
CREATE TABLE IF NOT EXISTS public.proposal_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_by text DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proposal_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert adjustments for proposals with token" ON public.proposal_adjustments
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND public_token IS NOT NULL)
  );

CREATE POLICY "Users manage own proposal adjustments" ON public.proposal_adjustments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND user_id = auth.uid())
  );

CREATE POLICY "Public can view adjustments for proposals with token" ON public.proposal_adjustments
  FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND public_token IS NOT NULL)
  );

-- proposal_payments table
CREATE TABLE IF NOT EXISTS public.proposal_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'pix',
  description text,
  amount numeric,
  pix_key text,
  qr_code_url text,
  payment_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proposal_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own proposal payments" ON public.proposal_payments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND user_id = auth.uid())
  );

CREATE POLICY "Public can view proposal payments with token" ON public.proposal_payments
  FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND public_token IS NOT NULL)
  );

-- contract_signatures table
CREATE TABLE IF NOT EXISTS public.contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signer_name text,
  signer_type text DEFAULT 'client',
  signature_image text NOT NULL,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contract signatures" ON public.contract_signatures
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND user_id = auth.uid())
  );

CREATE POLICY "Public can insert signatures for contracts with token" ON public.contract_signatures
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND public_token IS NOT NULL)
  );

CREATE POLICY "Public can view signatures for contracts with token" ON public.contract_signatures
  FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND public_token IS NOT NULL)
  );


-- Create contract_payments table
CREATE TABLE public.contract_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'pix',
  description TEXT,
  amount NUMERIC,
  pix_key TEXT,
  qr_code_url TEXT,
  payment_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;

-- Authenticated users manage own contract payments
CREATE POLICY "Users manage own contract payments"
  ON public.contract_payments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = contract_payments.contract_id AND contracts.user_id = auth.uid()
  ));

-- Public can view contract payments via public token
CREATE POLICY "Public can view contract payments with token"
  ON public.contract_payments
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = contract_payments.contract_id AND contracts.public_token IS NOT NULL
  ));

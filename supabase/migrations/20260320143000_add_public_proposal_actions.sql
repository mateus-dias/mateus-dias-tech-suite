CREATE OR REPLACE FUNCTION public.public_approve_proposal(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.proposals
  SET status = 'aprovada',
      updated_at = now()
  WHERE public_token = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_approve_proposal(text) TO anon, authenticated;


CREATE OR REPLACE FUNCTION public.public_request_proposal_changes(
  p_token text,
  p_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal_id uuid;
BEGIN
  SELECT id
  INTO v_proposal_id
  FROM public.proposals
  WHERE public_token = p_token
  LIMIT 1;

  IF v_proposal_id IS NULL THEN
    RAISE EXCEPTION 'Proposta não encontrada';
  END IF;

  INSERT INTO public.proposal_adjustments (proposal_id, message, created_by)
  VALUES (v_proposal_id, p_message, 'client');

  UPDATE public.proposals
  SET status = 'ajustes',
      updated_at = now()
  WHERE id = v_proposal_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_request_proposal_changes(text, text) TO anon, authenticated;

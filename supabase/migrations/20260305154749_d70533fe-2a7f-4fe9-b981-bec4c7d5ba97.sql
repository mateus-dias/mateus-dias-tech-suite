
-- Create enum types
CREATE TYPE public.lead_status AS ENUM (
  'novo', 'contato_iniciado', 'alinhamento', 'mvp_enviado', 'proposta_enviada', 
  'negociacao', 'contrato_enviado', 'assinado', 'projeto_andamento', 'finalizado', 'perdido'
);

CREATE TYPE public.lead_temperature AS ENUM ('frio', 'morno', 'quente');
CREATE TYPE public.lead_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.proposal_status AS ENUM ('rascunho', 'enviada', 'aprovada', 'ajustes', 'recusada');
CREATE TYPE public.contract_status AS ENUM ('rascunho', 'enviado', 'assinado_cliente', 'assinado_ambos', 'cancelado');
CREATE TYPE public.payment_status AS ENUM ('pendente', 'parcial', 'pago', 'cancelado');
CREATE TYPE public.payment_method AS ENUM ('pix', 'cartao', 'boleto', 'transferencia');
CREATE TYPE public.project_status AS ENUM ('planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado');
CREATE TYPE public.interaction_type AS ENUM (
  'mensagem', 'reuniao', 'mvp_enviado', 'proposta_enviada', 'follow_up', 
  'contrato_enviado', 'pagamento_recebido', 'ligacao', 'email', 'outro'
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles (admin users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Leads / Clients
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  origin TEXT,
  segment TEXT,
  priority lead_priority DEFAULT 'media',
  temperature lead_temperature DEFAULT 'morno',
  best_contact_time TEXT,
  status lead_status DEFAULT 'novo',
  estimated_value NUMERIC(12,2),
  notes TEXT,
  lovable_account TEXT,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Interactions (timeline)
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interactions" ON public.interactions FOR ALL USING (auth.uid() = user_id);

-- Proposals
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scope_included TEXT[],
  scope_excluded TEXT[],
  deadline TEXT,
  value NUMERIC(12,2),
  payment_terms TEXT,
  validity_days INTEGER DEFAULT 15,
  status proposal_status DEFAULT 'rascunho',
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  client_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own proposals" ON public.proposals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public proposals viewable by token" ON public.proposals FOR SELECT USING (public_token IS NOT NULL);

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Proposal Items
CREATE TABLE public.proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable with proposal" ON public.proposal_items FOR SELECT USING (true);
CREATE POLICY "Users manage proposal items" ON public.proposal_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.proposals WHERE id = proposal_id AND user_id = auth.uid())
);

-- Contracts
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT,
  client_document TEXT,
  client_address TEXT,
  scope TEXT,
  value NUMERIC(12,2),
  deadline TEXT,
  payment_terms TEXT,
  status contract_status DEFAULT 'rascunho',
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  pix_qr_code_url TEXT,
  pix_key TEXT,
  pix_value NUMERIC(12,2),
  mercadopago_link TEXT,
  client_signature_data TEXT,
  client_signature_date TIMESTAMPTZ,
  client_signature_ip TEXT,
  admin_signature_data TEXT,
  admin_signature_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contracts" ON public.contracts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public contracts viewable by token" ON public.contracts FOR SELECT USING (public_token IS NOT NULL);
CREATE POLICY "Clients can sign contracts" ON public.contracts FOR UPDATE USING (public_token IS NOT NULL) WITH CHECK (public_token IS NOT NULL);

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  description TEXT,
  value NUMERIC(12,2) NOT NULL,
  method payment_method,
  status payment_status DEFAULT 'pendente',
  pix_qr_code_url TEXT,
  pix_key TEXT,
  mercadopago_link TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own payments" ON public.payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public payments viewable via contract" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND public_token IS NOT NULL)
);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scope TEXT,
  deadline TEXT,
  status project_status DEFAULT 'planejamento',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Project Tasks (checklist)
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks viewable with project" ON public.project_tasks FOR SELECT USING (true);
CREATE POLICY "Users manage project tasks" ON public.project_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- Site visits / Analytics
CREATE TABLE public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view visits" ON public.site_visits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
);

-- Site settings
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.site_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read settings" ON public.site_settings FOR SELECT USING (true);

-- Public links
CREATE TABLE public.public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  lead_id UUID REFERENCES public.leads(id),
  proposal_id UUID REFERENCES public.proposals(id),
  contract_id UUID REFERENCES public.contracts(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.public_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own links" ON public.public_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public links viewable by token" ON public.public_links FOR SELECT USING (token IS NOT NULL);

-- Files
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id),
  proposal_id UUID REFERENCES public.proposals(id),
  contract_id UUID REFERENCES public.contracts(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own files" ON public.files FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Public can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

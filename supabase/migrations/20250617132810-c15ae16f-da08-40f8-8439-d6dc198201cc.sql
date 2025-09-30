
-- Créer la table pour les cartes
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT, -- ex: 'credit', 'debit', 'access', etc.
    card_number TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les affectations de cartes aux clients
CREATE TABLE public.client_card_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(client_id, card_id)
);

-- Créer la table pour les affectations de cartes aux utilisateurs
CREATE TABLE public.user_card_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, card_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_card_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_assignments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table cards
CREATE POLICY "Admins can manage all cards" 
  ON public.cards 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour client_card_assignments
CREATE POLICY "Admins can manage client card assignments" 
  ON public.client_card_assignments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour user_card_assignments
CREATE POLICY "Admins can manage user card assignments" 
  ON public.user_card_assignments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own card assignments
CREATE POLICY "Users can view their own card assignments" 
  ON public.user_card_assignments 
  FOR SELECT 
  USING (auth.uid() = user_id);

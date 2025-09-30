
-- Créer la table clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter une colonne client_id à la table profiles
ALTER TABLE public.profiles ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Activer RLS sur la table clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour que les admins puissent voir tous les clients
CREATE POLICY "Admins can view all clients" 
  ON public.clients 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Politique RLS pour que les admins puissent créer des clients
CREATE POLICY "Admins can create clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Politique RLS pour que les admins puissent modifier des clients
CREATE POLICY "Admins can update clients" 
  ON public.clients 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Politique RLS pour que les admins puissent supprimer des clients
CREATE POLICY "Admins can delete clients" 
  ON public.clients 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

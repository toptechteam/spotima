
-- Renommer la table clients en entreprises
ALTER TABLE public.clients RENAME TO entreprises;

-- Renommer la colonne client_id en entreprise_id dans la table profiles
ALTER TABLE public.profiles RENAME COLUMN client_id TO entreprise_id;

-- Renommer la colonne client_id en entreprise_id dans la table user_card_assignments
ALTER TABLE public.user_card_assignments RENAME COLUMN client_id TO entreprise_id;

-- Renommer la colonne client_id en entreprise_id dans la table client_card_assignments
ALTER TABLE public.client_card_assignments RENAME COLUMN client_id TO entreprise_id;

-- Renommer la table client_card_assignments en entreprise_card_assignments
ALTER TABLE public.client_card_assignments RENAME TO entreprise_card_assignments;

-- Mettre à jour les contraintes de clés étrangères
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_client_id_fkey,
  ADD CONSTRAINT profiles_entreprise_id_fkey 
    FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE SET NULL;

ALTER TABLE public.user_card_assignments
  DROP CONSTRAINT IF EXISTS user_card_assignments_client_id_fkey,
  ADD CONSTRAINT user_card_assignments_entreprise_id_fkey 
    FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id);

ALTER TABLE public.entreprise_card_assignments
  DROP CONSTRAINT IF EXISTS client_card_assignments_client_id_fkey,
  ADD CONSTRAINT entreprise_card_assignments_entreprise_id_fkey 
    FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id);

ALTER TABLE public.entreprise_card_assignments
  DROP CONSTRAINT IF EXISTS client_card_assignments_card_id_fkey,
  ADD CONSTRAINT entreprise_card_assignments_card_id_fkey 
    FOREIGN KEY (card_id) REFERENCES public.cards(id);

-- Mettre à jour les politiques RLS pour la table entreprises
DROP POLICY IF EXISTS "Admins can view all clients" ON public.entreprises;
DROP POLICY IF EXISTS "Admins can create clients" ON public.entreprises;
DROP POLICY IF EXISTS "Admins can update clients" ON public.entreprises;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.entreprises;

CREATE POLICY "Admins can view all entreprises" 
  ON public.entreprises 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create entreprises" 
  ON public.entreprises 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update entreprises" 
  ON public.entreprises 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete entreprises" 
  ON public.entreprises 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

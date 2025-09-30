
-- 1. Ajouter une contrainte unique sur le nom des cartes
ALTER TABLE public.cards 
ADD CONSTRAINT cards_name_unique UNIQUE (name);

-- 2. Insérer les outils manquants dans la table cards
INSERT INTO public.cards (name, description, type, is_active) VALUES
('Lucca congés', 'Outil de gestion des congés Lucca', 'RH', true),
('Lucca (fiche salarié)', 'Outil de gestion des fiches salariés Lucca', 'RH', true),
('BoondManager', 'Outil de gestion de projet et CRM', 'Gestion', true),
('Kelio', 'Outil de gestion des temps et activités', 'Temps', true)
ON CONFLICT (name) DO NOTHING;

-- 3. Ajouter une contrainte unique sur user_card_assignments pour éviter les doublons
ALTER TABLE public.user_card_assignments 
ADD CONSTRAINT user_card_assignments_unique_user_card 
UNIQUE (user_id, card_id);

-- 4. Améliorer les politiques RLS pour cards
DROP POLICY IF EXISTS "Admins can manage all cards" ON public.cards;

CREATE POLICY "Admins can manage all cards" 
  ON public.cards 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view cards assigned to their entreprise" 
  ON public.cards 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'admin') OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.entreprise_card_assignments eca ON p.entreprise_id = eca.entreprise_id
        WHERE p.id = auth.uid() AND eca.card_id = cards.id
      )
    )
  );

-- 5. Améliorer les politiques RLS pour entreprise_card_assignments
DROP POLICY IF EXISTS "Admins can manage client card assignments" ON public.entreprise_card_assignments;
DROP POLICY IF EXISTS "Admins can manage entreprise card assignments" ON public.entreprise_card_assignments;

CREATE POLICY "Admins can manage entreprise card assignments" 
  ON public.entreprise_card_assignments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their entreprise card assignments" 
  ON public.entreprise_card_assignments 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.entreprise_id = entreprise_card_assignments.entreprise_id
    )
  );

-- 6. Améliorer les politiques RLS pour user_card_assignments
DROP POLICY IF EXISTS "Admins can manage user card assignments" ON public.user_card_assignments;
DROP POLICY IF EXISTS "Users can view their own card assignments" ON public.user_card_assignments;

CREATE POLICY "Admins can manage user card assignments" 
  ON public.user_card_assignments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own card assignments" 
  ON public.user_card_assignments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 7. Améliorer les politiques RLS pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Créer une fonction pour automatiquement assigner les outils d'une entreprise à un utilisateur
CREATE OR REPLACE FUNCTION public.assign_entreprise_tools_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si l'utilisateur est assigné à une entreprise, lui assigner automatiquement tous les outils de cette entreprise
  IF NEW.entreprise_id IS NOT NULL THEN
    INSERT INTO public.user_card_assignments (user_id, card_id, entreprise_id)
    SELECT NEW.id, eca.card_id, NEW.entreprise_id
    FROM public.entreprise_card_assignments eca
    WHERE eca.entreprise_id = NEW.entreprise_id
    ON CONFLICT (user_id, card_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Créer le trigger pour assigner automatiquement les outils
DROP TRIGGER IF EXISTS on_profile_entreprise_update ON public.profiles;

CREATE TRIGGER on_profile_entreprise_update
  AFTER INSERT OR UPDATE OF entreprise_id ON public.profiles
  FOR EACH ROW
  WHEN (NEW.entreprise_id IS NOT NULL)
  EXECUTE FUNCTION public.assign_entreprise_tools_to_user();

-- 10. Créer une fonction pour assigner automatiquement un outil à tous les utilisateurs d'une entreprise
CREATE OR REPLACE FUNCTION public.assign_tool_to_entreprise_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Quand un outil est assigné à une entreprise, l'assigner automatiquement à tous les utilisateurs de cette entreprise
  INSERT INTO public.user_card_assignments (user_id, card_id, entreprise_id)
  SELECT p.id, NEW.card_id, NEW.entreprise_id
  FROM public.profiles p
  WHERE p.entreprise_id = NEW.entreprise_id
  ON CONFLICT (user_id, card_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 11. Créer le trigger pour assigner un outil à tous les utilisateurs d'une entreprise
DROP TRIGGER IF EXISTS on_entreprise_card_assignment ON public.entreprise_card_assignments;

CREATE TRIGGER on_entreprise_card_assignment
  AFTER INSERT ON public.entreprise_card_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_tool_to_entreprise_users();

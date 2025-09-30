
-- Créer une fonction pour supprimer automatiquement les affectations utilisateur 
-- quand un outil est retiré d'une entreprise
CREATE OR REPLACE FUNCTION public.remove_user_assignments_on_entreprise_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer toutes les affectations utilisateur pour cet outil dans cette entreprise
  DELETE FROM public.user_card_assignments
  WHERE card_id = OLD.card_id 
    AND entreprise_id = OLD.entreprise_id;
  
  RETURN OLD;
END;
$$;

-- Créer le trigger qui se déclenche quand on supprime une affectation entreprise-outil
DROP TRIGGER IF EXISTS on_entreprise_card_assignment_removal ON public.entreprise_card_assignments;

CREATE TRIGGER on_entreprise_card_assignment_removal
  AFTER DELETE ON public.entreprise_card_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_user_assignments_on_entreprise_removal();

-- Activer le realtime pour les tables concernées
ALTER TABLE public.user_card_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.entreprise_card_assignments REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_card_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.entreprise_card_assignments;

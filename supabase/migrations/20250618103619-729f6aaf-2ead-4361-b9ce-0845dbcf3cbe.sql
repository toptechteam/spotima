
-- Créer une fonction RPC pour récupérer tous les outils actifs sans restriction RLS
CREATE OR REPLACE FUNCTION public.get_all_active_tools()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT c.id, c.name, c.description, c.photo_url, c.is_active
  FROM public.cards c
  WHERE c.is_active = true
  ORDER BY c.name;
$$;

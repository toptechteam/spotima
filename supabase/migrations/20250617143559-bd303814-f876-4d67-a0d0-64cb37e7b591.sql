
-- Supprimer le profil de Fabien s'il existe
DELETE FROM public.profiles WHERE email = 'fabien.soranzo@soptima.fr';

-- Supprimer le rôle de Fabien s'il existe
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'fabien.soranzo@soptima.fr'
);

-- Note: Le compte auth.users sera supprimé via l'interface d'administration Supabase
-- car nous n'avons pas les permissions pour supprimer directement depuis auth.users

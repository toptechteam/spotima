-- Confirmer les emails des utilisateurs TopTech et leur assigner les rôles appropriés

-- Confirmer l'email de l'utilisateur admin@toptech.team
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE email = 'admin@toptech.team';

-- Confirmer l'email de l'utilisateur user@toptech.team  
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE email = 'user@toptech.team';

-- Assigner le rôle admin à admin@toptech.team
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@toptech.team'
ON CONFLICT (user_id, role) DO NOTHING;

-- Assigner le rôle user à user@toptech.team (rôle par défaut, mais on l'ajoute explicitement)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users 
WHERE email = 'user@toptech.team'
ON CONFLICT (user_id, role) DO NOTHING;
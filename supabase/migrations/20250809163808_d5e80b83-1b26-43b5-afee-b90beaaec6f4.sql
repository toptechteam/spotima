-- Corriger les display names des utilisateurs TopTech

-- Mettre à jour le display name pour admin@toptech.team
UPDATE public.profiles 
SET full_name = 'Admin TopTech'
WHERE email = 'admin@toptech.team';

-- Le nom pour user@toptech.team semble déjà correct, mais on s'assure qu'il est bien défini
UPDATE public.profiles 
SET full_name = 'User TopTech'
WHERE email = 'user@toptech.team';
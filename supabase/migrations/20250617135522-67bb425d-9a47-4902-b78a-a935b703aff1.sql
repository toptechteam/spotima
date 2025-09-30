
-- Créer un bucket pour stocker les photos de profil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true);

-- Ajouter une colonne photo_url à la table clients
ALTER TABLE public.clients ADD COLUMN photo_url TEXT;

-- Ajouter une colonne photo_url à la table profiles
ALTER TABLE public.profiles ADD COLUMN photo_url TEXT;

-- Politique de sécurité pour le bucket profile-photos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Users can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos');

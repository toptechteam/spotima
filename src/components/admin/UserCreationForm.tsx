
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { apiClient } from '@/lib/api';

interface Entreprise {
  id: string;
  name: string;
}

interface UserCreationFormProps {
  preSelectedClientId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserCreationForm({ preSelectedClientId, onSuccess, onCancel }: UserCreationFormProps) {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    photo_url: null as string | null,
    entreprise_id: preSelectedClientId || 'no-entreprise',
    role: 'user' as 'admin' | 'user'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntreprises();
  }, []);

  useEffect(() => {
    if (preSelectedClientId) {
      setFormData(prev => ({ ...prev, entreprise_id: preSelectedClientId }));
    }
  }, [preSelectedClientId]);

  const fetchEntreprises = async () => {
    try {
      let data = await apiClient.getEntreprises()

      debugger
      setEntreprises(data.data?.results || []);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = formData.photo_url;
      
      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        photoUrl = await fileToBase64(selectedFile);
      }

      let modal = {
        id: '',
        email: formData.email,
        full_name: formData.full_name,
        photo_url: photoUrl,
        company: preSelectedClientId || formData.entreprise_id,
        role: formData.role,
        password: formData.password
      }

      let data = await apiClient.createUser(modal)
      debugger
      console.log('User created via API client:', data);
      const entrepriseId = preSelectedClientId || (formData.entreprise_id === 'no-entreprise' ? null : formData.entreprise_id);
      
      const entrepriseName = entreprises.find(e => e.id === entrepriseId)?.name;
      const successMessage = entrepriseId
        ? `L'utilisateur a été créé avec succès et affecté à l'entreprise ${entrepriseName}. Les outils de l'entreprise ont été automatiquement assignés. Un email de confirmation a été envoyé.`
        : "L'utilisateur a été créé avec succès. Un email de confirmation a été envoyé.";

      toast({
        title: "Utilisateur créé",
        description: successMessage,
      });

      onSuccess();
      // Créer l'utilisateur avec l'API standard de Supabase
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       full_name: formData.full_name
      //     }
      //   }
      // });

      // if (authError) {
      //   console.error('Auth error:', authError);
      //   throw authError;
      // }

      // console.log('User created in auth:', authData);

      // if (authData.user) {
      //   // Si une entreprise est présélectionnée, s'assurer qu'elle soit utilisée
      //   const entrepriseId = preSelectedClientId || (formData.entreprise_id === 'no-entreprise' ? null : formData.entreprise_id);

      //   console.log('Updating profile with entreprise_id:', entrepriseId);

      //   // Attendre un peu pour que le trigger de création du profil se déclenche
      //   await new Promise(resolve => setTimeout(resolve, 1000));

      //   // Vérifier si le profil existe déjà
      //   const { data: existingProfile, error: profileCheckError } = await supabase
      //     .from('profiles')
      //     .select('*')
      //     .eq('id', authData.user.id)
      //     .single();

      //   console.log('Existing profile check:', existingProfile, profileCheckError);

        // Si le profil n'existe pas, le créer
        // if (profileCheckError && profileCheckError.code === 'PGRST116') {
        //   console.log('Creating profile manually...');
        //   const { error: profileCreateError } = await supabase
        //     .from('profiles')
        //     .insert({
        //       id: authData.user.id,
        //       email: formData.email,
        //       full_name: formData.full_name,
        //       photo_url: formData.photo_url,
        //       entreprise_id: entrepriseId
        //     });

        //   if (profileCreateError) {
        //     console.error('Error creating profile:', profileCreateError);
        //     throw profileCreateError;
        //   }
        // } else {
        //   // Mettre à jour le profil existant
        //   console.log('Updating existing profile...');
        //   const { error: profileError } = await supabase
        //     .from('profiles')
        //     .update({
        //       full_name: formData.full_name,
        //       photo_url: formData.photo_url,
        //       entreprise_id: entrepriseId
        //     })
        //     .eq('id', authData.user.id);

        //   if (profileError) {
        //     console.error('Error updating profile:', profileError);
        //     throw profileError;
        //   }
        // }

        // Assigner le rôle
        // console.log('Assigning role...');
        // const { error: roleError } = await supabase
        //   .from('user_roles')
        //   .insert({
        //     user_id: authData.user.id,
        //     role: formData.role
        //   });

        // if (roleError) {
        //   console.error('Error assigning role:', roleError);
        //   // Ne pas faire échouer la création si seulement l'assignation du rôle échoue
        // }

        // Vérification finale
        // const { data: finalProfile, error: finalCheckError } = await supabase
        //   .from('profiles')
        //   .select('*, entreprises(name)')
        //   .eq('id', authData.user.id)
        //   .single();

        // console.log('Final profile check:', finalProfile, finalCheckError);

      //   const entrepriseName = entreprises.find(e => e.id === entrepriseId)?.name;
      //   const successMessage = entrepriseId
      //     ? `L'utilisateur a été créé avec succès et affecté à l'entreprise ${entrepriseName}. Les outils de l'entreprise ont été automatiquement assignés. Un email de confirmation a été envoyé.`
      //     : "L'utilisateur a été créé avec succès. Un email de confirmation a été envoyé.";

      //   toast({
      //     title: "Utilisateur créé",
      //     description: successMessage,
      //   });

      //   onSuccess();
      // }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'utilisateur. Vérifiez que l'email n'est pas déjà utilisé.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Photo de profil</Label>
        <ImageUpload
          currentImageUrl={formData.photo_url}
          onImageChange={(file) => {
            if (file) {
              setSelectedFile(file);
              // Create a preview URL for the selected file
              const previewUrl = URL.createObjectURL(file);
              setFormData(prev => ({ ...prev, photo_url: previewUrl }));
            } else {
              setSelectedFile(null);
              setFormData(prev => ({ ...prev, photo_url: '' }));
            }
          }}
          placeholder="Photo de l'utilisateur"
          size="lg"
        />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="full_name">Nom complet</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="entreprise">Entreprise</Label>
        <Select
          value={formData.entreprise_id}
          onValueChange={(value) => setFormData({ ...formData, entreprise_id: value })}
          disabled={!!preSelectedClientId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une entreprise (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            {!preSelectedClientId && <SelectItem value="no-entreprise">Aucune entreprise</SelectItem>}
            {entreprises.map((entreprise) => (
              <SelectItem key={entreprise.id} value={entreprise.id}>
                {entreprise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {preSelectedClientId && (
          <p className="text-sm text-gray-500 mt-1">
            L'utilisateur sera automatiquement affecté à cette entreprise et recevra tous ses outils.
          </p>
        )}
        {!preSelectedClientId && formData.entreprise_id !== 'no-entreprise' && (
          <p className="text-sm text-green-600 mt-1">
            L'utilisateur recevra automatiquement tous les outils assignés à cette entreprise.
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select value={formData.role} onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

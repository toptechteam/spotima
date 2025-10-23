
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  is_company_admin:  boolean;
}

interface UserEditFormProps {
  user: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserEditForm({ user, onSuccess, onCancel }: UserEditFormProps) {
  debugger
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    photo_url: user.photo_url,
     role: user.is_company_admin ?  'admin' : 'user'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const userData: any = {
        full_name: formData.full_name || '',
        email: formData.email,
        role: formData.role
      };

      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        userData.photo_url = await fileToBase64(selectedFile);
      } else if (formData.photo_url && !formData.photo_url.startsWith('data:image')) {
        // If it's an existing URL that's not a base64 string, keep it as is
        userData.photo_url = formData.photo_url;
      } else if (!formData.photo_url) {
        // If no photo is selected and no existing photo, set to null
        userData.photo_url = null;
      }

      const response = await apiClient.updateUser(user.id, userData);

      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de modifier les informations de l'utilisateur.",
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
          onImageChange={(file: File | null) => {
            debugger
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
          placeholder="Photo de profil"
          size="lg"
        />
      </div>

      <div>
        <Label htmlFor="full_name">Nom complet</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Nom complet de l'utilisateur"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
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
          {loading ? 'Modification...' : 'Modifier'}
        </Button>
      </div>
    </form>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';

interface EntrepriseFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  photo_url: string | null;
}

interface EntrepriseFormProps {
  formData: EntrepriseFormData;
  setFormData: (data: EntrepriseFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}

export function EntrepriseForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  isEditing
}: EntrepriseFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleSubmitWithBase64 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a new file selected, convert it to base64 before submitting
    if (selectedFile) {
      try {
        debugger
        const base64String = await fileToBase64(selectedFile);
        formData.photo_url = base64String;
        setFormData(formData);
        // Wait for state to update before submitting
        setTimeout(() => onSubmit(e), 0);
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    } else {
      onSubmit(e);
    }
  };
  return (
    <form onSubmit={handleSubmitWithBase64} className="space-y-4">
      <div>
        <Label>Logo de l'entreprise</Label>
        <ImageUpload
          currentImageUrl={formData.photo_url}
          onImageChange={(file) => {
            if (file) {
              setSelectedFile(file);
              // Create a preview URL for the selected file
              const previewUrl = URL.createObjectURL(file);
              setFormData({ ...formData, photo_url: previewUrl });
            } else {
              setSelectedFile(null);
              setFormData({ ...formData, photo_url: '' });
            }
          }}
          placeholder="Logo de l'entreprise"
          size="lg"
        />
      </div>
      <div>
        <Label htmlFor="name">Nom de l'entreprise *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}

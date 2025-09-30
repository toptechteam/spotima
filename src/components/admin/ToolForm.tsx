
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ImageUpload';
import { Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';

interface ToolData {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  entreprises?: string[];
  company?: string[];

}

interface Entreprise {
  id: string;
  name: string;
}

interface ToolFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTool: ToolData | null;
  onToolSaved: () => void;
}

export function ToolForm({ isOpen, onClose, editingTool, onToolSaved }: ToolFormProps) {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [selectedEntreprises, setSelectedEntreprises] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchEntreprises();
      if (editingTool) {
        debugger
        setFormData({
          name: editingTool.name,
          description: editingTool.description || '',
          photo_url: editingTool.photo_url || '',
         
        });
        setSelectedEntreprises(editingTool?.company || []);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingTool]);

  const fetchEntreprises = async () => {
    try {
      const response = await apiClient.getEntreprises();
      setEntreprises(response.data?.results || []);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photo_url: previewUrl }));
    } else {
      setSelectedFile(null);
      setFormData(prev => ({ ...prev, photo_url: '' }));
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
    
    try {
      let photoUrl = formData.photo_url;
      
      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        photoUrl = await fileToBase64(selectedFile);
      }
      
      let assignments = []
      if (selectedEntreprises.length > 0) {
        assignments = selectedEntreprises.map(entrepriseId => entrepriseId);
      }
      const toolData = {
        name: formData.name,
        description: formData.description || null,
        photo_url: photoUrl || null,
        is_active: true,
        company: assignments
      };

      if (editingTool) {
        const response = await apiClient.updateTool(editingTool.id, toolData);

        toast({
          title: "Outil modifié",
          description: "Les informations de l'outil ont été mises à jour.",
        });
      } else {

        const response = await apiClient.createTool(toolData);
        // }

        toast({
          title: "Outil créé",
          description: "Le nouvel outil a été créé avec succès.",
        });
      }

      onClose();
      onToolSaved();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder l'outil.",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', photo_url: '' });
    setSelectedEntreprises([]);
    setSelectedFile(null);
  };

  const handleEntrepriseToggle = (entrepriseId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntreprises(prev => [...prev, entrepriseId]);
    } else {
      setSelectedEntreprises(prev => prev.filter(id => id !== entrepriseId));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTool ? 'Modifier l\'outil' : 'Nouvel outil'}
          </DialogTitle>
          <DialogDescription>
            {editingTool ? 'Modifiez les informations de l\'outil.' : 'Créez un nouvel outil.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Photo de l'outil</Label>
            <ImageUpload
              currentImageUrl={formData.photo_url}
              onImageChange={handleImageChange}
              placeholder="Photo de l'outil"
              size="md"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Entreprises ayant accès à cet outil</Label>
            <p className="text-sm text-gray-500 mb-3">
              Sélectionnez les entreprises qui pourront utiliser cet outil
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
              {entreprises.map((entreprise) => (
                <div key={entreprise.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`entreprise-${entreprise.id}`}
                    checked={selectedEntreprises.includes(entreprise.id)}
                    onCheckedChange={(checked) =>
                      handleEntrepriseToggle(entreprise.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`entreprise-${entreprise.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <Building className="h-3 w-3" />
                    {entreprise.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedEntreprises.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                {selectedEntreprises.length} entreprise(s) sélectionnée(s)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingTool ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EntrepriseUserManagement } from '@/components/admin/EntrepriseUserManagement';
import { EntrepriseForm } from '@/components/admin/EntrepriseForm';
import { EntrepriseListItem } from '@/components/admin/EntrepriseListItem';
import { apiClient } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';

interface Entreprise {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  created_at: string;
  user_count?: number;
}

interface EntrepriseFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  photo_url: string | null;
}

export function EntrepriseManagement() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserManagementDialogOpen, setIsUserManagementDialogOpen] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);
  const [selectedEntrepriseForUserManagement, setSelectedEntrepriseForUserManagement] = useState<Entreprise | null>(null);
  const [formData, setFormData] = useState<EntrepriseFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    photo_url: null
  });
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      photo_url: null
    });
    setEditingEntreprise(null);
  };

  const fetchEntreprises = async () => {
    try {
      setLoading(true);

      // Get all entreprises
      const { data: entreprisesData } = await apiClient.getEntreprises();

      // if (entreprisesError) throw entreprisesError;

      // For each entreprise, get user count
      // const entreprisesWithUserCount = await Promise.all(
      //   (entreprisesData || []).map(async (entreprise: any) => {
      //     try {
      //       // Assuming your API has an endpoint to get user count by entreprise_id
      //       const { data: userCountData } = await apiClient.get(`/profiles/count?entreprise_id=${entreprise.id}`);
      //       return { 
      //         ...entreprise, 
      //         user_count: userCountData?.count || 0 
      //       };
      //     } catch (error) {
      //       console.error('Error counting users for entreprise:', entreprise.id, error);
      //       return { ...entreprise, user_count: 0 };
      //     }
      //   })
      // );

      setEntreprises(entreprisesData?.results || []);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des entreprises.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entrepriseData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        photo_url: formData.photo_url
      };

      if (editingEntreprise) {
        // Update existing entreprise
        let data = await apiClient.updateEntreprise(editingEntreprise.id, entrepriseData);
        debugger
        if (data?.status == 200) {
          toast({
            title: "Entreprise modifiée",
            description: "L'entreprise a été modifiée avec succès.",
          });
        }
      } else {
        // Create new entreprise
        await apiClient.post('/companies/', entrepriseData);

        toast({
          title: "Entreprise créée",
          description: "L'entreprise a été créée avec succès.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEntreprises();
    } catch (error) {
      console.error('Error saving entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder l'entreprise.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entreprise: Entreprise) => {
    setEditingEntreprise(entreprise);
    setFormData({
      name: entreprise.name,
      email: entreprise.email || '',
      phone: entreprise.phone || '',
      address: entreprise.address || '',
      photo_url: entreprise.photo_url
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('entreprises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entreprise supprimée",
        description: "L'entreprise a été supprimée avec succès.",
      });

      fetchEntreprises();
    } catch (error) {
      console.error('Error deleting entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise.",
      });
    }
  };

  const openUserManagement = (entreprise: Entreprise) => {
    setSelectedEntrepriseForUserManagement(entreprise);
    setIsUserManagementDialogOpen(true);
  };

  const closeUserManagement = () => {
    setSelectedEntrepriseForUserManagement(null);
    setIsUserManagementDialogOpen(false);
    fetchEntreprises();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Entreprises et Utilisateurs</CardTitle>
            <CardDescription>
              Créez et gérez les entreprises clientes ainsi que leurs utilisateurs
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Entreprise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEntreprise ? 'Modifier l\'entreprise' : 'Créer une nouvelle entreprise'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEntreprise ? 'Modifiez les informations de l\'entreprise.' : 'Ajoutez une nouvelle entreprise à la plateforme.'}
                  </DialogDescription>
                </DialogHeader>
                <EntrepriseForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                  loading={loading}
                  isEditing={!!editingEntreprise}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {entreprises.map((entreprise) => (
              <EntrepriseListItem
                key={entreprise.id}
                entreprise={entreprise}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUserManagement={openUserManagement}
              />
            ))}
            {entreprises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune entreprise créée pour le moment.
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Dialog pour la gestion des utilisateurs */}
      <Dialog open={isUserManagementDialogOpen} onOpenChange={setIsUserManagementDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gestion des utilisateurs - {selectedEntrepriseForUserManagement?.name}
            </DialogTitle>
            <DialogDescription>
              Gérez les utilisateurs associés à cette entreprise.
            </DialogDescription>
          </DialogHeader>
          {selectedEntrepriseForUserManagement && (
            <EntrepriseUserManagement
              entrepriseId={selectedEntrepriseForUserManagement.id}
              entrepriseName={selectedEntrepriseForUserManagement.name}
              onUserCountChange={fetchEntreprises}
            />
          )}
          <div className="flex justify-end">
            <Button onClick={closeUserManagement}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

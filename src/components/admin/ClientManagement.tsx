
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Building, Users, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ImageUpload';
import { UserCreationForm } from '@/components/admin/UserCreationForm';

interface Entreprise {
  id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  created_at: string;
  user_count?: number;
  assigned_users?: UserProfile[];
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  entreprise_id: string | null;
}

export function ClientManagement() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);
  const [selectedEntrepriseForAssignment, setSelectedEntrepriseForAssignment] = useState<Entreprise | null>(null);
  const [selectedEntrepriseForUserCreation, setSelectedEntrepriseForUserCreation] = useState<Entreprise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    photo_url: null as string | null
  });
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
  const { toast } = useToast();

  useEffect(() => {
    fetchEntreprises();
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, photo_url, entreprise_id')
        .order('full_name');

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEntreprises = async () => {
    try {
      // Récupérer les entreprises
      const { data: entreprisesData, error: entreprisesError } = await supabase
        .from('entreprises')
        .select('*')
        .order('name');

      if (entreprisesError) throw entreprisesError;

      // Pour chaque entreprise, récupérer les utilisateurs assignés et compter
      const entreprisesWithUsers = await Promise.all(
        (entreprisesData || []).map(async (entreprise) => {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, email, full_name, photo_url, entreprise_id')
            .eq('entreprise_id', entreprise.id);

          if (usersError) {
            console.error('Error fetching users for entreprise:', usersError);
            return {
              ...entreprise,
              user_count: 0,
              assigned_users: []
            };
          }

          return {
            ...entreprise,
            user_count: users?.length || 0,
            assigned_users: users || []
          };
        })
      );

      setEntreprises(entreprisesWithUsers);
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
    
    try {
      let photoUrl = formData.photo_url;
      
      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        photoUrl = await fileToBase64(selectedFile);
      } else if (formData.photo_url && !formData.photo_url.startsWith('data:image')) {
        // If it's an existing URL that's not a base64 string, keep it as is
        photoUrl = formData.photo_url;
      } else if (!formData.photo_url) {
        // If no photo is selected and no existing photo, set to null
        photoUrl = null;
      }
      
      if (editingEntreprise) {
        // Update existing  
        const { error } = await supabase
          .from('entreprises')
          .update({
            name: formData.name,
            address: formData.address || null,
            photo_url: photoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntreprise.id);

        if (error) throw error;

        toast({
          title: "Entreprise modifiée",
          description: "Les informations de l'entreprise ont été mises à jour.",
        });
      } else {
        // Create new company
        const { error } = await supabase
          .from('entreprises')
          .insert([{
            name: formData.name,
            address: formData.address || null,
            photo_url: photoUrl
          }]);

        if (error) throw error;

        toast({
          title: "Entreprise créée",
          description: "La nouvelle entreprise a été créée avec succès.",
        });
      }

      setIsDialogOpen(false);
      setEditingEntreprise(null);
      setSelectedFile(null);
      setFormData({ name: '', address: '', photo_url: null });
      fetchEntreprises();
    } catch (error) {
      console.error('Error saving entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder l'entreprise.",
      });
    }
  };

  const handleEdit = (entreprise: Entreprise) => {
    setEditingEntreprise(entreprise);
    setFormData({
      name: entreprise.name,
      address: entreprise.address || '',
      photo_url: entreprise.photo_url
    });
    setSelectedFile(null); // Reset selected file when editing
    setIsDialogOpen(true);
  };

  const handleDelete = async (entrepriseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;

    try {
      const { error } = await supabase
        .from('entreprises')
        .delete()
        .eq('id', entrepriseId);

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

  const handleAssignUser = async (userId: string, entrepriseId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ entreprise_id: entrepriseId })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Utilisateur assigné",
        description: "L'utilisateur a été assigné à l'entreprise avec succès.",
      });

      fetchEntreprises();
      fetchAvailableUsers();
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      console.error('Error assigning user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'assigner l'utilisateur à l'entreprise.",
      });
    }
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ entreprise_id: null })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Utilisateur désassigné",
        description: "L'utilisateur a été retiré de l'entreprise.",
      });

      fetchEntreprises();
      fetchAvailableUsers();
    } catch (error) {
      console.error('Error unassigning user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retirer l'utilisateur de l'entreprise.",
      });
    }
  };

  const openUserAssignment = (entreprise: Entreprise) => {
    setSelectedEntrepriseForAssignment(entreprise);
    setIsAssignmentDialogOpen(true);
  };

  const openUserCreation = (entreprise: Entreprise | null = null) => {
    // Fermer tous les autres dialogues de manière synchrone
    setIsDialogOpen(false);
    setIsAssignmentDialogOpen(false);
    setEditingEntreprise(null);
    setSelectedEntrepriseForAssignment(null);
    
    // Configurer la création d'utilisateur
    setSelectedEntrepriseForUserCreation(entreprise);
    
    // Forcer l'ouverture du dialogue avec un timeout pour s'assurer que les autres sont fermés
    setTimeout(() => {
      setIsUserDialogOpen(true);
    }, 50);
  };

  const closeUserCreation = () => {
    setIsUserDialogOpen(false);
    setSelectedEntrepriseForUserCreation(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      photo_url: null
    });
    setSelectedFile(null);
    setEditingEntreprise(null);
  };

  const handleUserCreationSuccess = () => {
    closeUserCreation();
    fetchEntreprises();
    fetchAvailableUsers();
    toast({
      title: "Utilisateur créé",
      description: "Le nouvel utilisateur a été créé avec succès.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Entreprises</CardTitle>
            <CardDescription>
              Gérez les entreprises et leurs utilisateurs associés
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
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
                  {editingEntreprise ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntreprise ? 'Modifiez les informations de l\'entreprise.' : 'Créez une nouvelle entreprise.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Photo de l'entreprise</Label>
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
                    placeholder="Logo de l'entreprise"
                    size="lg"
                  />
                </div>
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
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => openUserCreation(editingEntreprise)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer un utilisateur
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingEntreprise ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {entreprises.map((entreprise) => (
              <div key={entreprise.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entreprise.photo_url || undefined} />
                      <AvatarFallback>
                        <Building className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entreprise.name}</p>
                      {entreprise.address && <p className="text-sm text-gray-500">{entreprise.address}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {entreprise.user_count} utilisateur{entreprise.user_count !== 1 ? 's' : ''}
                        </Badge>
                        {entreprise.assigned_users && entreprise.assigned_users.length > 0 && (
                          <div className="flex -space-x-2">
                            {entreprise.assigned_users.slice(0, 3).map((user) => (
                              <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={user.photo_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {entreprise.assigned_users.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                +{entreprise.assigned_users.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Créée le {new Date(entreprise.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUserAssignment(entreprise)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(entreprise)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entreprise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {entreprises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune entreprise trouvée.
              </div>
            )}
          </div>
        )}

        {/* Dialog d'assignation d'utilisateurs */}
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Gestion des utilisateurs - {selectedEntrepriseForAssignment?.name}
              </DialogTitle>
              <DialogDescription>
                Assignez ou retirez des utilisateurs de cette entreprise.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Utilisateurs assignés */}
              <div>
                <h4 className="font-medium mb-2">Utilisateurs assignés</h4>
                {selectedEntrepriseForAssignment?.assigned_users && selectedEntrepriseForAssignment.assigned_users.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEntrepriseForAssignment.assigned_users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photo_url || undefined} />
                            <AvatarFallback>
                              {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.full_name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignUser(user.id)}
                        >
                          Retirer
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun utilisateur assigné.</p>
                )}
              </div>

              {/* Utilisateurs disponibles */}
              <div>
                <h4 className="font-medium mb-2">Utilisateurs disponibles</h4>
                {availableUsers.filter(user => !user.entreprise_id).length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUsers
                      .filter(user => !user.entreprise_id)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photo_url || undefined} />
                              <AvatarFallback>
                                {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.full_name || user.email}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignUser(user.id, selectedEntrepriseForAssignment!.id)}
                          >
                            Assigner
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun utilisateur disponible.</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => openUserCreation(selectedEntrepriseForAssignment)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer un nouvel utilisateur
                </Button>
                <Button onClick={() => setIsAssignmentDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de création d'utilisateur */}
        <Dialog 
          open={isUserDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              closeUserCreation();
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                {selectedEntrepriseForUserCreation 
                  ? `Créer un utilisateur pour l'entreprise ${selectedEntrepriseForUserCreation.name}`
                  : 'Créer un nouvel utilisateur'
                }
              </DialogDescription>
            </DialogHeader>
            {isUserDialogOpen && (
              <UserCreationForm
                preSelectedClientId={selectedEntrepriseForUserCreation?.id}
                onSuccess={handleUserCreationSuccess}
                onCancel={closeUserCreation}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserEditForm } from '@/components/admin/UserEditForm';
import { UserListItem } from '@/components/admin/UserListItem';
import { UserManagementActions } from '@/components/admin/UserManagementActions';
import { useUserActivationStatus } from '@/hooks/useUserActivationStatus';
import { apiClient } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  role?: 'admin' | 'user';
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  is_active?: boolean;
}

interface EntrepriseUserManagementProps {
  entrepriseId: string;
  entrepriseName: string;
  onUserCountChange: () => void;
}

export function EntrepriseUserManagement({ entrepriseId, entrepriseName, onUserCountChange }: EntrepriseUserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const { fetchUserAuthStatus, getUserAuthData, loading: statusLoading } = useUserActivationStatus();

  useEffect(() => {
    fetchUsers();
    // demoteFabienSoranzo();
  }, [entrepriseId]);

  const demoteFabienSoranzo = async () => {
    try {
      const { data: fabienProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', 'Fabien SORANZO')
        .single();

      if (fabienProfile) {
        await supabase
          .from('user_roles')
          .update({ role: 'user' })
          .eq('user_id', fabienProfile.id);

        console.log('Fabien SORANZO rétrogradé en utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la rétrogradation de Fabien SORANZO:', error);
    }
  };

  const fetchUsers = async () => {
    console.log('🚀 Starting fetchUsers for enterprise:', entrepriseId);

    try {


      const { data: entreprisesData } = await apiClient.getEntrepriseUsers(entrepriseId);
      setUsers(entreprisesData.results || []);
      // const { data: profiles, error: profilesError } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('entreprise_id', entrepriseId)
      //   .order('created_at', { ascending: false });

      // if (profilesError) throw profilesError;

      // console.log('👥 Profiles fetched for enterprise:', profiles);

      // const { data: roles, error: rolesError } = await supabase
      //   .from('user_roles')
      //   .select('user_id, role');

      // if (rolesError) throw rolesError;

      // // Récupérer le statut d'authentification pour tous les utilisateurs
      // const userIds = profiles?.map(p => p.id) || [];
      // console.log('🎯 Fetching auth status for user IDs:', userIds);

      // if (userIds.length > 0) {
      //   await fetchUserAuthStatus(userIds);

      //   // Attendre que les données d'auth soient récupérées - augmentons le délai
      //   await new Promise(resolve => setTimeout(resolve, 2000));

      //   // Combiner toutes les données
      //   const usersWithRoles = profiles?.map(profile => {
      //     const userRole = roles?.find(role => role.user_id === profile.id)?.role || 'user';
      //     const authData = getUserAuthData(profile.id);

      //     // IMPORTANT: Un utilisateur est actif SEULEMENT si son email est confirmé ET qu'il s'est connecté au moins une fois
      //     const is_active = !!(authData?.email_confirmed_at && authData?.last_sign_in_at);

      //     console.log(`🔄 DETAILED Processing user ${profile.full_name || profile.email}:`, {
      //       id: profile.id,
      //       email: profile.email,
      //       authData_raw: authData,
      //       email_confirmed_at: authData?.email_confirmed_at,
      //       last_sign_in_at: authData?.last_sign_in_at,
      //       email_confirmed_exists: !!authData?.email_confirmed_at,
      //       last_sign_in_exists: !!authData?.last_sign_in_at,
      //       calculated_is_active: is_active,
      //       role: userRole
      //     });

      //     return {
      //       ...profile,
      //       role: userRole,
      //       email_confirmed_at: authData?.email_confirmed_at,
      //       last_sign_in_at: authData?.last_sign_in_at,
      //       is_active
      //     };
      //   }) || [];

      //   console.log('✅ Final users with CORRECTED activation status:', usersWithRoles);
      //   setUsers(usersWithRoles);
      // } else {
      //   setUsers([]);
      // }

    } catch (error) {
      console.error('💥 Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs.",
      });
    } finally {
      debugger
      setLoading(false);
    }
  };

  const removeUserFromEntreprise = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet utilisateur de l\'entreprise ?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('entreprise_id', ''); // Empty string to clear the company
      
      await apiClient.deleteUser(userId);

      toast({
        title: "Utilisateur retiré",
        description: "L'utilisateur a été retiré de l'entreprise.",
      });

      fetchUsers();
      onUserCountChange();
    } catch (error) {
      console.error('Error removing user from entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retirer l'utilisateur de l'entreprise.",
      });
    }
  };

  const handleUserCreationSuccess = () => {
    setIsUserDialogOpen(false);
    fetchUsers();
    onUserCountChange();
    toast({
      title: "Utilisateur créé",
      description: "Le nouvel utilisateur a été créé et affecté à l'entreprise.",
    });
  };

  const handleUserAssignmentSuccess = () => {
    setIsAssignmentDialogOpen(false);
    fetchUsers();
    onUserCountChange();
    toast({
      title: "Utilisateur affecté",
      description: "L'utilisateur a été affecté à l'entreprise avec succès.",
    });
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUserEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
    toast({
      title: "Utilisateur modifié",
      description: "Les informations de l'utilisateur ont été mises à jour.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Utilisateurs de l'entreprise ({users.length})</h4>
        <UserManagementActions
          entrepriseId={entrepriseId}
          entrepriseName={entrepriseName}
          isUserDialogOpen={isUserDialogOpen}
          setIsUserDialogOpen={setIsUserDialogOpen}
          isAssignmentDialogOpen={isAssignmentDialogOpen}
          setIsAssignmentDialogOpen={setIsAssignmentDialogOpen}
          onUserCreationSuccess={handleUserCreationSuccess}
          onUserAssignmentSuccess={handleUserAssignmentSuccess}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onRemove={removeUserFromEntreprise}
            />
          ))}
          {users.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Aucun utilisateur associé à cette entreprise.
            </div>
          )}
        </div>
      )}

      {/* Dialog pour modifier un utilisateur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {editingUser?.full_name || editingUser?.email}.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSuccess={handleUserEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

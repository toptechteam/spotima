
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Filter, User, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { useUserActivationStatus } from '@/hooks/useUserActivationStatus';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  role?: 'admin' | 'user';
  entreprise_id: string | null;
  entreprise_name?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  is_active?: boolean;
}

interface Entreprise {
  id: string;
  name: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntrepriseFilter, setSelectedEntrepriseFilter] = useState<string>('all');
  const { toast } = useToast();
  const { fetchUserAuthStatus, getUserActivationStatus, loading: statusLoading, authStatusMap } = useUserActivationStatus();

  useEffect(() => {
    fetchUsers();
    fetchEntreprises();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedEntrepriseFilter]);

  const fetchEntreprises = async () => {
    try {
      const response = await apiClient.getEntreprises();
      setEntreprises(response.data || []);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les entreprises. Veuillez réessayer.",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Récupérer les utilisateurs avec leurs profils et rôles
      const response = await apiClient.getUsersWithProfiles();
      const usersData = response.data || [];
      
      console.log('Users with profiles fetched:', usersData);
      
      // Mettre à jour les utilisateurs
      setUsers(usersData);
      
      // Mettre à jour le statut d'activation
      const userIds = usersData.map((user: UserProfile) => user.id);
      if (userIds.length > 0) {
        await fetchUserAuthStatus(userIds);
      }
      
      console.log('Fetching auth status for users:', userIds);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des utilisateurs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (selectedEntrepriseFilter === 'all') {
      setFilteredUsers(users);
    } else if (selectedEntrepriseFilter === 'no-entreprise') {
      setFilteredUsers(users.filter(user => !user.entreprise_id));
    } else {
      setFilteredUsers(users.filter(user => user.entreprise_id === selectedEntrepriseFilter));
    }
  };

  const handleResendActivation = async (email: string) => {
    try {
      await apiClient.resendActivationEmail(email);

      toast({
        title: "Email envoyé",
        description: `Un email d'activation a été envoyé à ${email}`,
      });
    } catch (error) {
      console.error('Error resending activation email:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email d'activation. Veuillez réessayer.",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.updateUserRole(userId, newRole);

      // Mettre à jour l'état local
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'admin' | 'user' } : user
      );
      setUsers(updatedUsers);

      toast({
        title: "Rôle mis à jour",
        description: `Le rôle de l'utilisateur a été mis à jour.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du rôle.",
      });
    }
  };

  const toggleUserRole = (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    handleRoleChange(userId, newRole);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Gérez les rôles et permissions des utilisateurs par entreprise
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un compte utilisateur et associez-le à une entreprise.
                </DialogDescription>
              </DialogHeader>
              <UserCreationForm
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchUsers();
                  toast({
                    title: "Utilisateur créé",
                    description: "Le nouvel utilisateur a été créé avec succès.",
                  });
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label htmlFor="entreprise-filter">Filtrer par entreprise :</Label>
          </div>
          <Select value={selectedEntrepriseFilter} onValueChange={setSelectedEntrepriseFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="no-entreprise">Sans entreprise associée</SelectItem>
              {entreprises.map((entreprise) => (
                <SelectItem key={entreprise.id} value={entreprise.id}>
                  {entreprise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {loading || statusLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photo_url || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.entreprise_name && (
                        <p className="text-sm text-blue-600">Entreprise: {user.entreprise_name}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'outline'}>
                        {user.is_active ? 'Actif' : 'En attente d\'activation'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Créé le {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserRole(user.id, user.role || 'user')}
                    disabled={user.email === 'databridge.admin@soptima.fr'}
                  >
                    {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir Admin'}
                  </Button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun utilisateur trouvé pour ce filtre.
              </div>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-gray-600">Total utilisateurs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.entreprise_id).length}</p>
              <p className="text-sm text-gray-600">Avec entreprise</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => !u.entreprise_id).length}</p>
              <p className="text-sm text-gray-600">Sans entreprise</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

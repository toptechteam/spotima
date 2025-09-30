
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Building, Edit, Check, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  entreprise_id: string | null;
  entreprise?: { name: string } | null;
}

interface Entreprise {
  id: string;
  name: string;
}

export function UserEntrepriseAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching users and entreprises data...');
      
      // Fetch users with their current entreprise using a left join
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          entreprise_id,
          entreprises!left(name)
        `)
        .order('full_name', { nullsFirst: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log('Users data fetched:', usersData);

      // Transform the data to match our interface
      const transformedUsers = usersData?.map(user => ({
        ...user,
        entreprise: user.entreprises ? { name: user.entreprises.name } : null
      })) || [];

      // Fetch all entreprises
      const { data: entreprisesData, error: entreprisesError } = await supabase
        .from('entreprises')
        .select('id, name')
        .order('name');

      if (entreprisesError) {
        console.error('Error fetching entreprises:', entreprisesError);
        throw entreprisesError;
      }

      console.log('Entreprises data fetched:', entreprisesData);

      setUsers(transformedUsers);
      setEntreprises(entreprisesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEntreprise = async (userId: string, entrepriseId: string | null) => {
    try {
      console.log('Assigning entreprise:', { userId, entrepriseId });
      
      const { error } = await supabase
        .from('profiles')
        .update({ entreprise_id: entrepriseId })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user entreprise:', error);
        throw error;
      }

      const entrepriseName = entreprises.find(e => e.id === entrepriseId)?.name;
      
      toast({
        title: "Affectation mise à jour",
        description: entrepriseId 
          ? `L'utilisateur a été affecté à ${entrepriseName}. Les outils de l'entreprise ont été automatiquement assignés.`
          : "L'utilisateur a été retiré de son entreprise.",
      });

      setEditingUser(null);
      setSelectedEntreprise('');
      fetchData();
    } catch (error) {
      console.error('Error updating user entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'affectation.",
      });
    }
  };

  const startEditing = (userId: string, currentEntrepriseId: string | null) => {
    setEditingUser(userId);
    setSelectedEntreprise(currentEntrepriseId || '');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setSelectedEntreprise('');
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affectation Utilisateurs - Entreprises</CardTitle>
        <CardDescription>
          Gérez l'affectation des utilisateurs aux entreprises. Les outils sont automatiquement assignés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lorsqu'un utilisateur est affecté à une entreprise, il recevra automatiquement tous les outils assignés à cette entreprise.
          </AlertDescription>
        </Alert>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Nombre d'utilisateurs trouvés: {users.length}
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Entreprise actuelle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {user.full_name || 'Nom non défini'}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.email}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Select value={selectedEntreprise} onValueChange={setSelectedEntreprise}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sélectionner une entreprise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucune entreprise</SelectItem>
                        {entreprises.map((entreprise) => (
                          <SelectItem key={entreprise.id} value={entreprise.id}>
                            {entreprise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {user.entreprise_id ? (
                        <>
                          <Building className="h-4 w-4" />
                          {user.entreprise?.name || 'Entreprise inconnue'}
                        </>
                      ) : (
                        <span className="text-gray-500">Aucune entreprise</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAssignEntreprise(user.id, selectedEntreprise || null)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(user.id, user.entreprise_id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

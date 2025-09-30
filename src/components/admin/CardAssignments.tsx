
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, Building, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CardData {
  id: string;
  name: string;
  card_number: string | null;
  type: string | null;
  is_active: boolean | null;
}

interface Entreprise {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  entreprise_id: string | null;
}

interface EntrepriseCardAssignment {
  id: string;
  entreprise_id: string;
  card_id: string;
  assigned_at: string;
  entreprises: { name: string };
  cards: { name: string; card_number: string | null; type: string | null };
}

interface UserCardAssignment {
  id: string;
  user_id: string;
  card_id: string;
  entreprise_id: string;
  assigned_at: string;
  user_profile: { full_name: string | null; email: string | null };
  cards: { name: string; card_number: string | null; type: string | null };
  entreprises: { name: string };
}

export function CardAssignments() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [entrepriseAssignments, setEntrepriseAssignments] = useState<EntrepriseCardAssignment[]>([]);
  const [userAssignments, setUserAssignments] = useState<UserCardAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEntrepriseDialogOpen, setIsEntrepriseDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserEntreprise, setSelectedUserEntreprise] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (cardsError) throw cardsError;

      // Fetch entreprises
      const { data: entreprisesData, error: entreprisesError } = await supabase
        .from('entreprises')
        .select('id, name')
        .order('name');

      if (entreprisesError) throw entreprisesError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, entreprise_id')
        .order('full_name');

      if (usersError) throw usersError;

      // Fetch entreprise card assignments
      const { data: entrepriseAssignmentsData, error: entrepriseAssignmentsError } = await supabase
        .from('entreprise_card_assignments')
        .select(`
          *,
          entreprises(name),
          cards(name, card_number, type)
        `)
        .order('assigned_at', { ascending: false });

      if (entrepriseAssignmentsError) throw entrepriseAssignmentsError;

      // Fetch user card assignments with manual join
      const { data: userAssignmentsData, error: userAssignmentsError } = await supabase
        .from('user_card_assignments')
        .select(`
          *,
          cards(name, card_number, type),
          entreprises(name)
        `)
        .order('assigned_at', { ascending: false });

      if (userAssignmentsError) throw userAssignmentsError;

      // Manually fetch user profiles for assignments
      const userAssignmentsWithProfiles = [];
      if (userAssignmentsData) {
        for (const assignment of userAssignmentsData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', assignment.user_id)
            .single();

          userAssignmentsWithProfiles.push({
            ...assignment,
            user_profile: profileData || { full_name: null, email: null }
          });
        }
      }

      setCards(cardsData || []);
      setEntreprises(entreprisesData || []);
      setUsers(usersData || []);
      setEntrepriseAssignments(entrepriseAssignmentsData || []);
      setUserAssignments(userAssignmentsWithProfiles);
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

  const handleAssignCardToEntreprise = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('entreprise_card_assignments')
        .insert({
          entreprise_id: selectedEntreprise,
          card_id: selectedCard
        });

      if (error) throw error;

      toast({
        title: "Carte affectée",
        description: "La carte a été affectée à l'entreprise avec succès.",
      });

      setIsEntrepriseDialogOpen(false);
      setSelectedEntreprise('');
      setSelectedCard('');
      fetchData();
    } catch (error) {
      console.error('Error assigning card to entreprise:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'affecter la carte à l'entreprise.",
      });
    }
  };

  const handleAssignCardToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('user_card_assignments')
        .insert({
          user_id: selectedUser,
          card_id: selectedCard,
          entreprise_id: selectedUserEntreprise
        });

      if (error) throw error;

      toast({
        title: "Carte affectée",
        description: "La carte a été affectée à l'utilisateur avec succès.",
      });

      setIsUserDialogOpen(false);
      setSelectedUser('');
      setSelectedCard('');
      setSelectedUserEntreprise('');
      fetchData();
    } catch (error) {
      console.error('Error assigning card to user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'affecter la carte à l'utilisateur.",
      });
    }
  };

  const handleRemoveEntrepriseAssignment = async (assignmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette affectation ?')) return;

    try {
      const { error } = await supabase
        .from('entreprise_card_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Affectation supprimée",
        description: "L'affectation de la carte à l'entreprise a été supprimée.",
      });

      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'affectation.",
      });
    }
  };

  const handleRemoveUserAssignment = async (assignmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette affectation ?')) return;

    try {
      const { error } = await supabase
        .from('user_card_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Affectation supprimée",
        description: "L'affectation de la carte à l'utilisateur a été supprimée.",
      });

      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'affectation.",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affectation des Cartes</CardTitle>
        <CardDescription>
          Gérez l'affectation des cartes aux entreprises et utilisateurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entreprises" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entreprises">Entreprises</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="entreprises" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cartes affectées aux entreprises</h3>
              <Dialog open={isEntrepriseDialogOpen} onOpenChange={setIsEntrepriseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Affecter une carte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Affecter une carte à une entreprise</DialogTitle>
                    <DialogDescription>
                      Sélectionnez une entreprise et une carte à affecter.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAssignCardToEntreprise} className="space-y-4">
                    <div>
                      <Label htmlFor="entreprise">Entreprise *</Label>
                      <Select value={selectedEntreprise} onValueChange={setSelectedEntreprise} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                          {entreprises.map((entreprise) => (
                            <SelectItem key={entreprise.id} value={entreprise.id}>
                              {entreprise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="card">Carte *</Label>
                      <Select value={selectedCard} onValueChange={setSelectedCard} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une carte" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.name} {card.card_number && `(${card.card_number})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEntrepriseDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Affecter
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Carte</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Affectée le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrepriseAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {assignment.entreprises.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{assignment.cards.name}</p>
                          {assignment.cards.card_number && (
                            <p className="text-sm text-gray-500 font-mono">{assignment.cards.card_number}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.cards.type && (
                        <Badge variant="outline">{assignment.cards.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEntrepriseAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {entrepriseAssignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Aucune affectation trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cartes affectées aux utilisateurs</h3>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Affecter une carte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Affecter une carte à un utilisateur</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un utilisateur et une carte à affecter.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAssignCardToUser} className="space-y-4">
                    <div>
                      <Label htmlFor="user">Utilisateur *</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un utilisateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="userEntreprise">Entreprise de l'utilisateur *</Label>
                      <Select value={selectedUserEntreprise} onValueChange={setSelectedUserEntreprise} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                          {entreprises.map((entreprise) => (
                            <SelectItem key={entreprise.id} value={entreprise.id}>
                              {entreprise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="card">Carte *</Label>
                      <Select value={selectedCard} onValueChange={setSelectedCard} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une carte" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.name} {card.card_number && `(${card.card_number})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Affecter
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Carte</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Affectée le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {assignment.user_profile.full_name || assignment.user_profile.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {assignment.entreprises.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{assignment.cards.name}</p>
                          {assignment.cards.card_number && (
                            <p className="text-sm text-gray-500 font-mono">{assignment.cards.card_number}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.cards.type && (
                        <Badge variant="outline">{assignment.cards.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUserAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {userAssignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucune affectation trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

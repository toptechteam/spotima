
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface UserAssignmentToEntrepriseProps {
  entrepriseId: string;
  entrepriseName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserAssignmentToEntreprise({ 
  entrepriseId, 
  entrepriseName, 
  onSuccess, 
  onCancel 
}: UserAssignmentToEntrepriseProps) {
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnassignedUsers();
  }, []);

  const fetchUnassignedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .is('entreprise_id', null)
        .order('full_name', { nullsFirst: false });

      if (error) throw error;
      setUnassignedUsers(data || []);
    } catch (error) {
      console.error('Error fetching unassigned users:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs non affectés.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;

    setAssigning(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ entreprise_id: entrepriseId })
        .eq('id', selectedUserId);

      if (error) throw error;

      toast({
        title: "Utilisateur affecté",
        description: `L'utilisateur a été affecté à ${entrepriseName} avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error assigning user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'affecter l'utilisateur à l'entreprise.",
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Affectez un utilisateur existant à l'entreprise <strong>{entrepriseName}</strong>
        </p>
        
        {unassignedUsers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Aucun utilisateur non affecté disponible.
          </p>
        ) : (
          <>
            <div>
              <Label htmlFor="user-select">Sélectionner un utilisateur</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un utilisateur..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {user.full_name || 'Nom non défini'} ({user.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Annuler
        </Button>
        <Button 
          onClick={handleAssignUser} 
          disabled={!selectedUserId || assigning || unassignedUsers.length === 0}
        >
          <Check className="h-4 w-4 mr-1" />
          {assigning ? 'Affectation...' : 'Affecter'}
        </Button>
      </div>
    </div>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { UserAssignmentToEntreprise } from '@/components/admin/UserAssignmentToEntreprise';

interface UserManagementActionsProps {
  entrepriseId: string;
  entrepriseName: string;
  isUserDialogOpen: boolean;
  setIsUserDialogOpen: (open: boolean) => void;
  isAssignmentDialogOpen: boolean;
  setIsAssignmentDialogOpen: (open: boolean) => void;
  onUserCreationSuccess: () => void;
  onUserAssignmentSuccess: () => void;
}

export function UserManagementActions({
  entrepriseId,
  entrepriseName,
  isUserDialogOpen,
  setIsUserDialogOpen,
  isAssignmentDialogOpen,
  setIsAssignmentDialogOpen,
  onUserCreationSuccess,
  onUserAssignmentSuccess
}: UserManagementActionsProps) {
  return (
    <div className="flex gap-2">
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Créer utilisateur
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un compte utilisateur pour l'entreprise {entrepriseName}.
            </DialogDescription>
          </DialogHeader>
          <UserCreationForm
            preSelectedClientId={entrepriseId}
            onSuccess={onUserCreationSuccess}
            onCancel={() => setIsUserDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-1" />
            Affecter utilisateur
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Affecter un utilisateur existant</DialogTitle>
            <DialogDescription>
              Sélectionnez un utilisateur existant pour l'affecter à {entrepriseName}.
            </DialogDescription>
          </DialogHeader>
          <UserAssignmentToEntreprise
            entrepriseId={entrepriseId}
            entrepriseName={entrepriseName}
            onSuccess={onUserAssignmentSuccess}
            onCancel={() => setIsAssignmentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

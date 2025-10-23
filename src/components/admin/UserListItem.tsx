
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserX, Crown, Edit, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  role?: 'admin' | 'user';
  email_confirmed_at?: string | null;
  is_active?: boolean;
  is_company_admin:  boolean;
}

interface UserListItemProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onRemove: (userId: string) => void;
}

export function UserListItem({ user, onEdit, onRemove }: UserListItemProps) {
  const { toast } = useToast();

  const handleResendActivation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action.",
        });
        return;
      }

      console.log('Calling resend activation for:', user.email);

      const { data, error } = await supabase.functions.invoke('resend-activation-email', {
        body: { userEmail: user.email },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Function response:', data);
      
      toast({
        title: "Email envoyé",
        description: `Le lien d'activation a été renvoyé à ${user.email}`,
      });
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email d\'activation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de renvoyer le lien d'activation.",
      });
    }
  };

  // Utiliser directement is_active qui est calculé correctement dans les composants parents
  const isEmailConfirmed = user.is_active === true;

  console.log(`UserListItem - User ${user.email}:`, {
    email_confirmed_at: user.email_confirmed_at,
    is_active: user.is_active,
    isEmailConfirmed
  });

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.photo_url || undefined} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.full_name || user.email}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400">
            Créé le {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
            {user.is_company_admin ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Administrateur
              </>
            ) : (
              'Utilisateur'
            )}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant={isEmailConfirmed ? 'success' : 'warning'}>
              {isEmailConfirmed ? 'Email confirmé' : 'Email non confirmé'}
            </Badge>
            {!isEmailConfirmed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendActivation}
                className="h-6 px-2 text-xs"
              >
                <Mail className="h-3 w-3 mr-1" />
                Renvoyer
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(user.id)}
          disabled={user.email === 'databridge.admin@soptima.fr'}
        >
          <UserX className="h-4 w-4 mr-1" />
          Retirer
        </Button>
      </div>
    </div>
  );
}

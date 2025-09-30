
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Edit, Trash2 } from 'lucide-react';
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

interface EntrepriseListItemProps {
  entreprise: Entreprise;
  onEdit: (entreprise: Entreprise) => void;
  onDelete: (id: string) => void;
  onUserManagement: (entreprise: Entreprise) => void;
}

export function EntrepriseListItem({
  entreprise,
  onEdit,
  onDelete,
  onUserManagement
}: EntrepriseListItemProps) {
  const { isAdmin } = useUserRole();
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {entreprise.photo_url ? (
            <img
              src={entreprise.photo_url}
              alt={entreprise.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{entreprise.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {entreprise.user_count || 0} utilisateur{(entreprise.user_count || 0) > 1 ? 's' : ''}
              </Badge>
            </div>
            {entreprise.email && (
              <p className="text-sm text-gray-500">{entreprise.email}</p>
            )}
            {entreprise.phone && (
              <p className="text-sm text-gray-500">{entreprise.phone}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500 mr-4">
          Créée le {new Date(entreprise.created_at).toLocaleDateString()}
        </p>


        <Button
          variant="outline"
          size="sm"
          onClick={() => onUserManagement(entreprise)}
        >
          <Users className="h-4 w-4 mr-1" />
          Gestion utilisateurs
        </Button>
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(entreprise)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(entreprise.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Wrench, Building } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface ToolData {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  company_names?: any[];
  company?: any[];
}

interface ToolListProps {
  tools: ToolData[];
  loading: boolean;
  onEdit: (tool: ToolData) => void;
  onDelete: (toolId: string) => void;
  onToggleStatus: (toolId: string, currentStatus: boolean | null) => void;
}

export function ToolList({ tools, loading, onEdit, onDelete, onToggleStatus }: ToolListProps) {
  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const { isAdmin } = useUserRole();


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Outil</TableHead>
          <TableHead>Entreprises</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Créé le</TableHead>
          {isAdmin && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => (
          <TableRow key={tool.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={tool.photo_url || undefined} />
                  <AvatarFallback>
                    <Wrench className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tool.name}</p>
                  {tool.description && (
                    <p className="text-sm text-gray-500">{tool.description}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {tool.company_names && tool.company_names.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tool.company_names.map((entreprise, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Building className="h-3 w-3 mr-1" />
                      {entreprise?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Aucune entreprise</span>
              )}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { isAdmin ? onToggleStatus(tool.id, tool.is_active) : '' }}
              >
                <Badge variant={tool.is_active ? "default" : "secondary"}>
                  {tool.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </Button>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {new Date(tool.created_at).toLocaleDateString()}
            </TableCell>

            {isAdmin && (


              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(tool)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>

            )}
          </TableRow>
        ))}
        {tools.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
              Aucun outil trouvé.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

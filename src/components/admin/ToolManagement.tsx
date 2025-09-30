
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { ToolForm } from './ToolForm';
import { ToolList } from './ToolList';
import { useUserRole } from '@/hooks/useUserRole';

interface ToolData {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  entreprises?: string[];
}

export function ToolManagement() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolData | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await apiClient.getTool();
      setTools(response.data?.results || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les outils. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tool: ToolData) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  const handleDeleteTool = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) {
      return;
    }

    try {
      await apiClient.deleteTool(id);

      toast({
        title: "Succès",
        description: "L'outil a été supprimé avec succès.",
      });

      await fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'outil.",
      });
    }
  };

  const toggleToolStatus = async (toolId: string, currentStatus: boolean | null) => {
    try {
      await apiClient.updateToolStatus(toolId, { is_active: !currentStatus });

      toast({
        title: "Statut modifié",
        description: "Le statut de l'outil a été mis à jour.",
      });

      fetchTools();
    } catch (error) {
      console.error('Error updating tool status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de l'outil.",
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTool(null);
  };

  const handleNewTool = () => {
    setEditingTool(null);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Outils</CardTitle>
            <CardDescription>
              Créez et gérez les outils disponibles pour les clients
            </CardDescription>
          </div>
          {isAdmin &&
            <Button onClick={handleNewTool}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Outil
            </Button>
          }
        </div>
      </CardHeader>
      <CardContent>
        <ToolList
          tools={tools}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteTool}
          onToggleStatus={toggleToolStatus}
        />
        <ToolForm
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          editingTool={editingTool}
          onToolSaved={fetchTools}
        />
      </CardContent>
    </Card>
  );
}

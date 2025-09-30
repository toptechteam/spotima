
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CardData {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  card_number: string | null;
  is_active: boolean | null;
  created_at: string;
}

export function CardManagement() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    card_number: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des cartes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update({
            name: formData.name,
            description: formData.description || null,
            type: formData.type || null,
            card_number: formData.card_number || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCard.id);

        if (error) throw error;

        toast({
          title: "Carte modifiée",
          description: "Les informations de la carte ont été mises à jour.",
        });
      } else {
        const { error } = await supabase
          .from('cards')
          .insert({
            name: formData.name,
            description: formData.description || null,
            type: formData.type || null,
            card_number: formData.card_number || null
          });

        if (error) throw error;

        toast({
          title: "Carte créée",
          description: "La nouvelle carte a été créée avec succès.",
        });
      }

      setIsDialogOpen(false);
      setEditingCard(null);
      setFormData({ name: '', description: '', type: '', card_number: '' });
      fetchCards();
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la carte.",
      });
    }
  };

  const handleEdit = (card: CardData) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      description: card.description || '',
      type: card.type || '',
      card_number: card.card_number || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      toast({
        title: "Carte supprimée",
        description: "La carte a été supprimée avec succès.",
      });

      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la carte.",
      });
    }
  };

  const toggleCardStatus = async (cardId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ is_active: !currentStatus })
        .eq('id', cardId);

      if (error) throw error;

      toast({
        title: "Statut modifié",
        description: "Le statut de la carte a été mis à jour.",
      });

      fetchCards();
    } catch (error) {
      console.error('Error updating card status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de la carte.",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', type: '', card_number: '' });
    setEditingCard(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Cartes</CardTitle>
            <CardDescription>
              Créez et gérez les cartes disponibles pour les clients
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Carte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? 'Modifier la carte' : 'Nouvelle carte'}
                </DialogTitle>
                <DialogDescription>
                  {editingCard ? 'Modifiez les informations de la carte.' : 'Créez une nouvelle carte.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    placeholder="ex: crédit, débit, accès..."
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="card_number">Numéro de carte</Label>
                  <Input
                    id="card_number"
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingCard ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{card.name}</p>
                        {card.description && (
                          <p className="text-sm text-gray-500">{card.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {card.type && (
                      <Badge variant="outline">{card.type}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {card.card_number || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardStatus(card.id, card.is_active)}
                    >
                      <Badge variant={card.is_active ? "default" : "secondary"}>
                        {card.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(card.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(card)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {cards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Aucune carte trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

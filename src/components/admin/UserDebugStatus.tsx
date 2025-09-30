
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

interface UserDebugInfo {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  is_active_calculated: boolean;
}

interface DebugData {
  total_users: number;
  users: UserDebugInfo[];
}

export function UserDebugStatus() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch debug data on component mount
  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<DebugData>('/admin/debug/user-status');

      setDebugData({
        total_users: data.total_users,
        users: data.users || []
      });

      toast({
        title: "Données récupérées",
        description: `${data.total_users} utilisateurs trouvés`,
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des données de debug:', err);
      setError("Impossible de charger les données de débogage");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des données.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !debugData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des données de débogage...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="mb-4">{error}</p>
        <Button onClick={fetchDebugData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Statut de débogage des utilisateurs</CardTitle>
          <Button 
            onClick={fetchDebugData} 
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {debugData ? (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium">Résumé</h3>
              <p className="text-sm text-muted-foreground">
                {debugData.total_users} utilisateur{debugData.total_users !== 1 ? 's' : ''} au total
              </p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">Comptes actifs</p>
                  <p className="text-2xl font-bold">
                    {debugData.users.filter(u => u.is_active_calculated).length}
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">Emails confirmés</p>
                  <p className="text-2xl font-bold">
                    {debugData.users.filter(u => u.email_confirmed_at).length}
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">Dernière connexion</p>
                  <p className="text-sm">
                    {debugData.users.length > 0 
                      ? new Date(Math.max(...debugData.users
                          .map(u => u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0)
                        )).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <h3 className="font-medium">Détails des utilisateurs</h3>
                <div className="space-y-2">
                  {debugData.users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {user.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={user.email_confirmed_at ? 'default' : 'outline'}>
                            {user.email_confirmed_at ? 'Email confirmé' : 'Email non confirmé'}
                          </Badge>
                          <Badge variant={user.is_active_calculated ? 'default' : 'outline'}>
                            {user.is_active_calculated ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Créé le</p>
                          <p>{new Date(user.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dernière connexion</p>
                          <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Jamais'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dernière mise à jour</p>
                          <p>{new Date(user.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucune donnée disponible. Essayez de rafraîchir la page.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

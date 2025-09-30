import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/AdminRoute';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Database, Shield, Building, Wrench } from 'lucide-react';
import { EntrepriseManagement } from '@/components/admin/EntrepriseManagement';
import { ToolManagement } from '@/components/admin/ToolManagement';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const AdminPage = () => {
  const [stats, setStats] = useState({
    entreprises: 0,
    users: 0,
    tools: 0,
    admins: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    handleOrphanUser();
  }, []);

  const handleOrphanUser = async () => {
    try {
      const userId = '99099eee-fff7-4fcf-8f32-b04cbd7ab65a';
      
      // Create Fabien SORANZO with admin role
      await apiClient.createUserWithRole(
        {
          id: userId,
          email: 'fabien.soranzo@soptima.fr',
          full_name: 'Fabien SORANZO',
          entreprise_id: 'soptima' // This should be replaced with actual entreprise ID
        },
        'admin'
      );

      console.log('Fabien SORANZO ajouté avec succès à SOPTIMA');
    } catch (error) {
      if ((error as any).response?.status === 409) {
        console.log('L\'utilisateur existe déjà');
        return;
      }
      console.error('Erreur lors de l\'ajout de l\'utilisateur orphelin:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getAdminStats();
      const statsData = response.data;
      
      setStats({
        entreprises: statsData.companies || 0,
        users: statsData.users || 0,
        tools: statsData.tools || 0,
        admins: statsData.admins || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Fallback to default values if API call fails
      setStats({
        entreprises: 0,
        users: 0,
        tools: 0,
        admins: 0
      });
    }
  };

  return (
    <AdminRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Administration</h1>
            <p className="text-gray-600">Gestion des entreprises, utilisateurs, outils et du système</p>
          </div>

          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entreprises</p>
                    <p className="text-2xl font-bold">{stats.entreprises}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold">{stats.users}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outils</p>
                    <p className="text-2xl font-bold">{stats.tools}</p>
                  </div>
                  <Wrench className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                    <p className="text-2xl font-bold">{stats.admins}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Système</p>
                    <p className="text-2xl font-bold text-green-600">Actif</p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestion des entreprises avec gestion des utilisateurs intégrée */}
          <div className="mb-8">
            <EntrepriseManagement />
          </div>

          {/* Gestion des outils */}
          <div className="mb-8">
            <ToolManagement />
          </div>
        </div>
      </Layout>
    </AdminRoute>
  );
};

export default AdminPage;

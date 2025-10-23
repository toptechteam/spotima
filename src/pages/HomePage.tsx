import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTools } from "@/hooks/useUserTools";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTools } from "@/hooks/useTools";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Wrench } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const HomePage = () => {
  const { user, loading } = useAuth();
  const { userTools, loading: toolsLoading } = useUserTools();
  const { profile, getFirstName } = useUserProfile();
  const { tools, loading: allToolsLoading } = useTools();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Mettre à jour les outils Lucca avec l'image correcte au premier chargement
  useEffect(() => {
    // const updateLuccaTools = async () => {
    //   if (tools.length > 0) {
    //     const luccaImageUrl = "/lovable-uploads/5858ca3e-d8f3-4c71-9310-9dc7d99d6b9b.png";

    //     const luccaTools = tools.filter(tool =>
    //       tool.name.toLowerCase().includes('lucca') && !tool.photo_url
    //     );

    //     if (luccaTools.length > 0) {
    //       const { supabase } = await import('@/integrations/supabase/client');

    //       for (const tool of luccaTools) {
    //         await supabase
    //           .from('cards')
    //           .update({ photo_url: luccaImageUrl })
    //           .eq('id', tool.id);
    //       }
    //     }
    //   }
    // };

    // updateLuccaTools();
  }, [tools]);

  if (loading || toolsLoading || allToolsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  const firstName = getFirstName();
  const userAssignedTools = tools.filter(tool => userTools.includes(tool.id));
  const unavailableTools = tools.filter(tool => !userTools.includes(tool.id));
  console.log('Outils assignés:', userAssignedTools.map(t => t.name));
  console.log('Outils non assignés:', unavailableTools.map(t => t.name));
  const getToolIcon = (tool: { name: string; photo_url: string | null }) => {
    if (tool.photo_url) {
      return <img src={tool.photo_url} alt={tool.name} className="w-full" />;
    }
    return <Wrench className="h-12 w-12" />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.photo_url || undefined} alt={firstName || "Utilisateur"} />
                <AvatarFallback className="bg-soptima-100 text-soptima-700 font-semibold">
                  {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-xl text-muted-foreground">
                {firstName ? `Bonjour ${firstName}` : 'Bonjour'}
              </p>
            </div>
            <p className="text-muted-foreground">
              Simplifiez votre processus de retraitement via vos outils disponibles.
            </p>
          </div>

          {/* Mes outils disponibles */}
          <section className="mb-20 text-center">
            <h2 className="text-2xl font-semibold mb-6">Mes outils disponibles</h2>
            {userAssignedTools.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {userAssignedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    icon={getToolIcon(tool)}
                    subtitle={tool.description || `Importez vos données depuis ${tool.name}`}
                    isAssigned={true}
                    isAuthenticated={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">
                  Aucun outil n'est actuellement assigné à votre compte.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Contactez votre administrateur pour activer vos outils.
                </p>
              </div>
            )}
          </section>

          {/* Vos solutions SIRH / ERP */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold mb-6">Vos solutions SIRH / ERP</h2>
            <p className="text-muted-foreground mb-6">
              Ces outils peuvent être activés sur demande. Contactez le{" "}
              <a
                href="mailto:support@soptima.fr"
                className="text-soptima-600 hover:text-soptima-700 underline font-semibold"
              >
                support
              </a>
              {" "}pour plus d'informations.
            </p>

            {unavailableTools.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {unavailableTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    icon={getToolIcon(tool)}
                    subtitle={tool.description || `Importez vos données depuis ${tool.name}`}
                    isAssigned={false}
                    isAuthenticated={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">
                  Tous les outils disponibles vous sont déjà assignés.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;


import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ToolCard } from "@/components/ToolCard";
import { DataFlowAnimation } from "@/components/DataFlowAnimation";
import { useUserRole } from "@/hooks/useUserRole";

const allTools = [
  {
    id: "lucca-conges",
    name: "Lucca",
    description: "Gestion des congés et des absences",
    iconUrl: "/assets/luca.png",
    category: "RH"
  },
  {
    id: "lucca-fiche-salarie",
    name: "Combo",
    description: "Gestion des plannings, du pointage",
    iconUrl: "/assets/combo.png",
    category: "RH"
  },
  {
    id: "boondmanager",
    name: "BoondManager",
    description: "Gestion des ressources humaines et projets",
    iconUrl: "/assets/bond.png",
    category: "ERP"
  },
  {
    id: "kelio",
    name: "Kelio",
    description: "Gestion des temps et des activités",
    iconUrl: "/assets/kelio.png",
    category: "RH"
  }
];

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est connecté, le rediriger selon son rôle
    if (!loading && !roleLoading && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  }, [user, loading, isAdmin, roleLoading, navigate]);

  if (loading || roleLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Section Hero avec fond dégradé style PayFit */}
      <section className="relative bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Fond dégradé avec bords arrondis et marges */}
            <div className="relative">
              <div className="absolute inset-x-8 top-0 bottom-0 bg-gradient-to-b from-[#EAF3FF] to-white rounded-3xl"></div>
              
              {/* Hero Section */}
              <div className="relative z-10 text-center px-16 py-16">
                <h1 className="text-5xl font-bold mb-8" style={{ color: '#001E42' }}>
                  Smart Bridge
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Évitez la ressaisie et simplifiez le processus de retraitement des données entre vos solutions SIRH/ERP et PayFit. 
                  Notre Bridge automatise les transferts de données pour vous faire gagner du temps et réduire les erreurs.
                </p>
                
                <div className="mb-8">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="px-8 py-3"
                  >
                    Se connecter
                  </Button>
                </div>

                {/* Data Flow Animation Section */}
                <div className="mb-0">
                  <DataFlowAnimation />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Marketplace avec fond blanc et marges latérales */}
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-t-3xl px-8 pt-8 pb-16 shadow-sm">
            <h2 className="text-3xl font-semibold text-center mb-12">Vos solutions SIRH / ERP</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allTools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  id={tool.id}
                  name={tool.name}
                  icon={<img src={tool.iconUrl} alt={tool.name} className="h-12 w-12" />}
                  subtitle={tool.description}
                  isAssigned={false}
                  isAuthenticated={false}
                  isClickable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

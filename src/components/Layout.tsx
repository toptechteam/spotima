import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import homelogo from '@/assets/homelogo.jpeg';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50 opacity-80 rounded-full blur-3xl"></div>
      </div>

      <Header />
      <main className={cn("flex-1 pt-20 relative z-10", className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin, is_company_admin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center cursor-pointer ml-28" onClick={handleLogoClick}>
          <img
            src={homelogo}
            alt="SOPTIMA Logo"
            className="h-8 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 mr-28">
          {user && (
            <a href="mailto:support@soptima.fr" className="text-base font-semibold text-gray-700 hover:text-soptima-600 transition-colors">
              Support
            </a>
          )}
          {(isAdmin || is_company_admin) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              Administration
            </Button>
          )}
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-white py-6 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SOPTIMA. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/legal/mentions-legales')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Mentions légales
            </button>
            <button
              onClick={() => navigate('/legal/politique-confidentialite')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Politique de confidentialité
            </button>
            <button
              onClick={() => navigate('/legal/conditions-generales')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Conditions Générales d'Utilisation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

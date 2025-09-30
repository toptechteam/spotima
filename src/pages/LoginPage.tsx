
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="https://drive.google.com/uc?export=view&id=13VAweAkY3__DFVEpZpj5OvrjExp4L1gr" 
            alt="Logo" 
            className="h-12 w-auto"
          />
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Connexion à votre espace BRIDGE
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à l'interface d'import automatisé
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} SOPTIMA. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default LoginPage;

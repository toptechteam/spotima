import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileType2, Info } from "lucide-react";

const toolNames: Record<string, string> = {
  lucca: "Lucca",
  workday: "Workday",
  successfactors: "SAP SuccessFactors",
  excel: "Excel Générique",
};

const UploadPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api'
      : `${window.location.origin}/api`);
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const toolName = toolId ? toolNames[toolId] : "l'outil sélectionné";

  const handleSourceFileUpload = (file: File) => {
    setSourceFile(file);
  };

  const handleTargetFileUpload = (file: File) => {
    setTargetFile(file);
  };

  const handleSubmit = async () => {
    if (!sourceFile || !targetFile) {
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('input_file', sourceFile);
      formData.append('target_file', targetFile);
      // Add tool_id if available
      if (toolId) {
        formData.append('tool_id', toolId);
      }
      const response = await fetch(API_BASE_URL + '/process-files/', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the correct boundary
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,

        }
      });

      if (!response.ok) {
        throw new Error('File processing failed');
      }
      const data = await response.json();
      checkStatusOfFile(data.task_id);

    } catch (error) {
      console.error('Error processing files:', error);
      // You might want to show an error toast/message to the user here
    } finally {
      
    }
  };

  const checkStatusOfFile = async (id) => {
    const response = await fetch(API_BASE_URL + `/file-processing/status/${id}/`, {
      method: 'GET',
      // Don't set Content-Type header, let the browser set it with the correct boundary
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('File processing failed');
    }
    const data = await response.json();
    if (data.audit_status != 'completed') {
      setTimeout(() => {
        checkStatusOfFile(id);
      }, 10000);
      return;
    }
    downloadFile(id);
  }

  const downloadFile = async (id) => {
    const response = await fetch(API_BASE_URL + `/file-processing/download/${id}/`, {
      method: 'GET',
      // Don't set Content-Type header, let the browser set it with the correct boundary
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
      : `converted_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Create a download URL for the blob
    const downloadUrl = window.URL.createObjectURL(blob);
    setIsProcessing(false);
    navigate(`/download/${toolId}`, {
      state: {
        originalFileName: sourceFile.name,
        targetFileName: targetFile.name,
        convertedFileName: filename,
        downloadUrl: JSON.stringify(downloadUrl)
      }
    });

  }


  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 text-gray-500 hover:text-gray-700"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la sélection d'outils
          </Button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Importez vos fichiers
            </h1>
            <p className="text-gray-500">
              Notre outil va convertir automatiquement vos données en utilisant le fichier source et le modèle Payfit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zone d'upload fichier source */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Fichier source {toolName}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Uploadez votre fichier source
              </p>
              <UploadZone
                onFileUpload={handleSourceFileUpload}
                acceptedFileTypes=".xlsx,.csv,.xls"
              />
            </div>

            {/* Zone d'upload fichier cible Payfit */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Fichier cible
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Uploadez votre fichier cible Payfit à utiliser pour la conversion
              </p>
              <UploadZone
                onFileUpload={handleTargetFileUpload}
                acceptedFileTypes=".xlsx,.xls"
              />
            </div>
          </div>

          {/* Bouton traiter centré entre les zones d'upload et l'aide */}
          <div className="text-center mt-8 mb-8">
            <Button
              onClick={handleSubmit}
              disabled={!sourceFile || !targetFile || isProcessing}
              className="w-full sm:w-auto px-8"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement en cours...
                </>
              ) : (
                "Traiter les fichiers"
              )}
            </Button>
            {(!sourceFile || !targetFile) && (
              <p className="text-sm text-gray-500 mt-2">
                Veuillez uploader les deux fichiers pour continuer
              </p>
            )}
          </div>

          {/* Instructions pour télécharger le modèle Payfit */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Comment télécharger le modèle Payfit ?
                </h3>
                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                  <li>Connectez-vous à votre espace Payfit</li>
                  <li>Dans le menu, cliquez sur "Absences et temps de travail"</li>
                  <li>Puis cliquez sur "Imports multiples"</li>
                  <li>Dans la section Import des variables de paie, cliquez sur l'icône "Importer" à droite</li>
                  <li>Puis téléchargez un modèle</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;

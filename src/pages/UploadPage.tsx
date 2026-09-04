import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const isLcFitnessTool = (name?: string | null) => {
  if (!name) return false;
  const lower = name.toLowerCase();
  const compact = lower.replace(/[\s_\-]+/g, "");
  return compact.includes("lcfitness") || lower.includes("lc fitness");
};

const UploadPage = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000/api"
      : `${window.location.origin}/api`);
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFile2, setSourceFile2] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolDisplayName, setToolDisplayName] = useState<string>("l'outil sélectionné");
  const [isLcFitness, setIsLcFitness] = useState(false);
  // Avoid rendering the wrong layout first (2 slots → 3 slots swap causes DOM removeChild errors)
  const [toolReady, setToolReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!toolId) return;
    let cancelled = false;
    setToolReady(false);
    setIsLcFitness(false);
    setSourceFile(null);
    setSourceFile2(null);
    setTargetFile(null);
    (async () => {
      try {
        const response = await apiClient.getToolById(toolId);
        const tool = response.data;
        if (cancelled) return;
        const name = tool?.name || "l'outil sélectionné";
        setToolDisplayName(name);
        setIsLcFitness(isLcFitnessTool(name));
      } catch (err) {
        console.error("Failed to load tool", err);
      } finally {
        if (!cancelled) {
          setToolReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toolId]);

  const canSubmit = isLcFitness
    ? Boolean(targetFile && (sourceFile || sourceFile2))
    : Boolean(sourceFile && targetFile);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("target_file", targetFile as File);
      if (sourceFile) {
        formData.append("input_file", sourceFile);
      }
      if (isLcFitness && sourceFile2) {
        formData.append("input_file_2", sourceFile2);
      }
      if (toolId) {
        formData.append("tool_id", toolId);
      }
      const response = await fetch(API_BASE_URL + "/process-files/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("File processing failed");
      }
      const data = await response.json();
      checkStatusOfFile(data.task_id);
    } catch (error) {
      console.error("Error processing files:", error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le traitement des fichiers a échoué.",
      });
    }
  };

  const checkStatusOfFile = async (id) => {
    const response = await fetch(API_BASE_URL + `/file-processing/status/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("File processing failed");
    }
    const data = await response.json();
    if (data.audit_status == "processing") {
      setTimeout(() => {
        checkStatusOfFile(id);
      }, 10000);
      return;
    } else if (data.audit_status == "failed") {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: data.error_message,
      });
      return;
    }

    downloadFile(id, data.row_status);
  };

  const downloadFile = async (id, status) => {
    const response = await fetch(API_BASE_URL + `/file-processing/download/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1].replace(/['"]/g, "")
      : `converted_${new Date().toISOString().split("T")[0]}.xlsx`;

    const downloadUrl = window.URL.createObjectURL(blob);
    setIsProcessing(false);
    navigate(`/download/${toolId}`, {
      state: {
        id: id,
        status: status,
        originalFileName: sourceFile?.name,
        targetFileName: targetFile?.name,
        convertedFileName: filename,
        downloadUrl: JSON.stringify(downloadUrl),
      },
    });
  };

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
              {!toolReady
                ? "Chargement de l'outil…"
                : isLcFitness
                  ? "LC FITNESS : choisissez le fichier comptable, le fichier salaire, ou les deux — puis le modèle PayFit."
                  : "Notre outil va convertir automatiquement vos données en utilisant le fichier source et le modèle PayFit."}
            </p>
          </div>

          {!toolReady ? (
            <div className="flex justify-center py-16 text-gray-500" aria-busy="true">
              Chargement des zones d&apos;import…
            </div>
          ) : isLcFitness ? (
            <div key={`lc-${toolId}`} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Export comptable
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Fichier LC FITNESS Holding – établissement (optionnel — seul ou avec le salaire)
                </p>
                <UploadZone
                  key={`lc-comptable-${toolId}`}
                  onFileUpload={setSourceFile}
                  acceptedFileTypes=".xlsx,.xls"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Fichier salaire
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Fichier Salaire du mois (optionnel — seul ou avec le comptable)
                </p>
                <UploadZone
                  key={`lc-salaire-${toolId}`}
                  onFileUpload={setSourceFile2}
                  acceptedFileTypes=".xlsx,.xls"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Fichier cible PayFit
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Modèle import_variables_paie (obligatoire)
                </p>
                <UploadZone
                  key={`lc-payfit-${toolId}`}
                  onFileUpload={setTargetFile}
                  acceptedFileTypes=".xlsx,.xls"
                />
              </div>
            </div>
          ) : (
            <div key={`std-${toolId}`} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Fichier source {toolDisplayName}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Uploadez votre fichier source
                </p>
                <UploadZone
                  key={`std-source-${toolId}`}
                  onFileUpload={setSourceFile}
                  acceptedFileTypes=".xlsx,.csv,.xls"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Fichier cible
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Uploadez votre fichier cible PayFit à utiliser pour la conversion
                </p>
                <UploadZone
                  key={`std-target-${toolId}`}
                  onFileUpload={setTargetFile}
                  acceptedFileTypes=".xlsx,.xls"
                />
              </div>
            </div>
          )}

          <div className="text-center mt-8 mb-8">
            <Button
              onClick={handleSubmit}
              disabled={!toolReady || !canSubmit || isProcessing}
              className="w-full sm:w-auto px-8"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Traitement en cours...
                </>
              ) : (
                "Traiter les fichiers"
              )}
            </Button>
            {toolReady && !canSubmit && (
              <p className="text-sm text-gray-500 mt-2">
                {isLcFitness
                  ? "Uploadez au moins un fichier source (comptable et/ou salaire) et le modèle PayFit"
                  : "Veuillez uploader les deux fichiers pour continuer"}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Comment télécharger le modèle PayFit ?
                </h3>
                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                  <li>Connectez-vous à votre espace PayFit</li>
                  <li>Dans le menu, cliquez sur "Absences et temps de travail"</li>
                  <li>Puis cliquez sur "Imports multiples"</li>
                  <li>
                    Dans la section Import des variables de paie, cliquez sur l'icône
                    "Importer" à droite
                  </li>
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

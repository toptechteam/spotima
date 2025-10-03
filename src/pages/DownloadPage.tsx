
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DownloadResult } from "@/components/DownloadResult";

const toolNames: Record<string, string> = {
  lucca: "Lucca",
  workday: "Workday",
  successfactors: "SAP SuccessFactors",
  excel: "Excel Générique",
};

const DownloadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();

  const state = location.state as {
    originalFileName?: string;
    convertedFileName?: string;
    downloadUrl: any
  } | undefined;

  const toolName = toolId ? toolNames[toolId] : "l'outil sélectionné";

  const convertedFileName = state?.convertedFileName || "payfit_import.xlsx";

  const handleDownload = () => {
    // Simulate file download
    // In a real app, this would trigger an actual file download
    const element = document.createElement("a");
    element.setAttribute("download", convertedFileName);
    debugger
    // Create a dummy blob for demo purposes
    const url = JSON.parse(state.downloadUrl) 

    element.setAttribute("href", url);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRestart = () => {
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <DownloadResult
          fileName={convertedFileName}
          onDownload={handleDownload}
          onRestart={handleRestart}
        />
      </div>
    </Layout>
  );
};

export default DownloadPage;

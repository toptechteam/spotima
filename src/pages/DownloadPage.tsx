
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DownloadResult } from "@/components/DownloadResult";
import { useEffect, useState } from "react";

const toolNames: Record<string, string> = {
  lucca: "Lucca",
  workday: "Workday",
  successfactors: "SAP SuccessFactors",
  excel: "Excel Générique",
};

const DownloadPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const location = useLocation();
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();
  const [data, setData] = useState<any>(null);

  const state = location.state as {
    originalFileName?: string;
    convertedFileName?: string;
    downloadUrl: any
    id: string;
    status: string;
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
    navigate("/upload/" + toolId);
  };

  useEffect(() => {
    if (state.status == 'failed' || !state) {
      getFileErrorData();
    }
  }, [state]);

  const getFileErrorData = async () => {
    const response = await fetch(API_BASE_URL + `/file-processing/errors/${state.id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch file error data');
    }
    const data = await response.json();
    if (data.length == 0) {
      setData(null);
    }
    else {
      setData(data);
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <DownloadResult
          data={data}
          fileName={convertedFileName}
          onDownload={handleDownload}
          onRestart={handleRestart}
        />
      </div>
    </Layout>
  );
};

export default DownloadPage;

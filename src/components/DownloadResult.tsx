
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface DownloadResultProps {
  data: any;
  fileName: string;
  onDownload: () => void;
  onRestart: () => void;
}

export function DownloadResult({ data, fileName, onDownload, onRestart }: DownloadResultProps) {
  debugger
  return (
    <>

      <div className="animate-fade-in flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Votre fichier au format Payfit est prêt !
        </h2>

        <p className="text-gray-500 mb-6">
          Le fichier <span className="font-medium text-gray-700">{fileName}</span> a été généré avec succès et est prêt à être téléchargé.
        </p>

        <div className="flex flex-col w-full gap-3 mb-6">
          <Button onClick={onDownload} className="gap-2">
            <FileDown size={18} />
            Télécharger le fichier Payfit
          </Button>

          <Button variant="outline" onClick={onRestart}>
            Traiter un autre fichier
          </Button>
        </div>


        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left w-full">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Comment importer dans Payfit</h3>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Connectez-vous à votre compte Payfit</li>
            <li>Accédez à la section "Absences et temps de travail"</li>
            <li>Sélectionnez "Imports multiples"</li>
            <li>Chargez le fichier téléchargé</li>
          </ol>
        </div>

      </div>
      {data && data.length > 0 &&
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left w-1/2 mt-5 mx-auto">
          <h3 className="text-sm font-medium text-red-800 mb-2">Tâches manuelles à prévoir: non prises en charge par l'import multiple de Payfit</h3>
          <div className="mb-4 text-sm text-blue-700  h-[300px] overflow-y-auto">

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                   <th  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> ligne# </th>
                   <th  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Nom </th>
                   <th  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Erreur </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((error: any, index: number) => (
                  <tr key={index}>
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {error.rowno} </td>
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {error.row_data?.firstname}  {error.row_data?.surname} </td>
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {error.error} </td>
                    {/* {Object.values(error).map((value: any, i) => (
                      <>
                        {Object.keys(error)[i] != 'row_data' && <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {String(value)}
                        </td>
                        }
                      </>

                    ))} */}
                  </tr>
                ))}


              </tbody>
            </table>
          </div>  </div>
      }
    </>

  );
}

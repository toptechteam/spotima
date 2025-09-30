
import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string;
  className?: string;
}

export function UploadZone({ 
  onFileUpload, 
  acceptedFileTypes = ".xlsx,.csv", 
  className 
}: UploadZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !acceptedFileTypes.includes(`.${fileExt}`)) {
      alert(`Veuillez sélectionner un fichier au format ${acceptedFileTypes}`);
      return;
    }

    setFileName(file.name);
    onFileUpload(file);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all text-center",
          isDraggingOver 
            ? "border-soptima-400 bg-soptima-50" 
            : "border-gray-300 hover:border-soptima-300 bg-gray-50 hover:bg-gray-100",
          fileName ? "border-green-300 bg-green-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept={acceptedFileTypes}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          {fileName ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Fichier sélectionné</p>
              <p className="text-sm text-gray-500 mb-4">{fileName}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Changer de fichier
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-soptima-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-soptima-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Déposez votre fichier ici
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-gray-500">
                Formats acceptés: {acceptedFileTypes}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

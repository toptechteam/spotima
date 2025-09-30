
import { FileText } from "lucide-react";

export function DataFlowAnimation() {
  return (
    <div className="flex items-center justify-center gap-12 py-8">
      {/* Source File Icon - Modern file icon */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-2 shadow-sm">
          <FileText className="h-10 w-10 text-blue-600" />
        </div>
        <span className="text-sm text-muted-foreground">Fichier source</span>
      </div>

      {/* Animated Dotted Flow - Centered and bigger */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-soptima-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.8s'
              }}
            />
          ))}
        </div>
      </div>

      {/* PayFit File Icon with your provided logo */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-2 shadow-sm">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/7a277d3b-f78b-4de1-b9c9-e1db65274095.png"
              alt="PayFit" 
              className="h-10 w-10 rounded"
            />
          </div>
        </div>
        <span className="text-sm text-muted-foreground">Fichier PayFit</span>
      </div>
    </div>
  );
}

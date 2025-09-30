
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
  isAssigned?: boolean;
  isAuthenticated?: boolean;
  isClickable?: boolean;
}

export function ToolCard({ 
  id, 
  name, 
  icon, 
  subtitle, 
  className,
  isAssigned = true,
  isAuthenticated = false,
  isClickable = true
}: ToolCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (isClickable && (isAssigned || !isAuthenticated)) {
      navigate(`/upload/${id}`);
    }
  };

  const defaultSubtitle = `Importez vos données de congés depuis ${name}`;
  const isDisabled = isAuthenticated && !isAssigned;
  const shouldShowHover = isClickable && !isDisabled;

  return (
    <div
      className={cn(
        "relative transition-all duration-300 group w-56 h-48",
        isClickable && !isDisabled ? "cursor-pointer" : "cursor-default",
        shouldShowHover && isHovering ? "scale-105" : "scale-100",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleCardClick}
    >
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-soptima-100 transition-opacity duration-300",
        shouldShowHover && isHovering ? "opacity-100" : "opacity-0"
      )}></div>
      
      {/* Status Badge */}
      {isAuthenticated && (
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            variant={isAssigned ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isAssigned 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-gray-100 text-gray-600 border-gray-200"
            )}
          >
            {isAssigned ? "Disponible" : "Indisponible"}
          </Badge>
        </div>
      )}
      
      <div className={cn(
        "relative border rounded-xl bg-white overflow-hidden p-4 flex flex-col items-center text-center h-full",
        "shadow-lg shadow-gray-200/50",
        shouldShowHover ? "hover:shadow-xl hover:shadow-gray-300/60 hover:border-soptima-100" : "",
        "transition-all duration-300",
        isDisabled && "opacity-50 bg-gray-50"
      )}>
        <div className={cn(
          "h-20 w-20 mb-3 flex items-center justify-center text-soptima-600 flex-shrink-0 relative",
          isDisabled && "text-gray-400"
        )}>
          {icon}
          {isDisabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <h3 className={cn(
          "font-semibold text-base mb-2 line-clamp-2",
          isDisabled && "text-gray-500"
        )}>
          {name}
        </h3>
        <span className={cn(
          "text-xs text-muted-foreground line-clamp-3 flex-grow flex items-center",
          isDisabled && "text-gray-400"
        )}>
          {subtitle || defaultSubtitle}
        </span>
      </div>
    </div>
  );
}

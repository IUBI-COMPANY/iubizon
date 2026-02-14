import React from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

export const ScrollProgressBar: React.FC = () => {
  const progress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-orange-500 to-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(242,95,12,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

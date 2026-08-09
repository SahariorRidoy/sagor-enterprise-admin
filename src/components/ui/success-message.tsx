"use client";

import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface SuccessMessageProps {
  message: string;
  onComplete?: () => void;
  delay?: number;
}

export const SuccessMessage = ({ 
  message, 
  onComplete, 
  delay = 2000 
}: SuccessMessageProps) => {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, delay);
      return () => clearTimeout(timer);
    }
  }, [onComplete, delay]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <p className="text-center text-green-700 font-medium">{message}</p>
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
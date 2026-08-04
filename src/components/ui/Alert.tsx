"use client";

import React from "react";
import { CheckCircle2, Info, AlertTriangle, Bell, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const CONFIG: Record<
  AlertVariant,
  {
    wrapper: string;
    icon: React.ReactNode;
    titleColor: string;
  }
> = {
  success: {
    wrapper: "bg-green-50 border border-green-200",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />,
    titleColor: "text-green-700",
  },
  info: {
    wrapper: "bg-blue-50 border border-blue-200",
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    titleColor: "text-blue-700",
  },
  error: {
    wrapper: "bg-red-50 border border-red-200",
    icon: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    titleColor: "text-red-600",
  },
  warning: {
    wrapper: "bg-yellow-50 border border-yellow-200",
    icon: <Bell className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />,
    titleColor: "text-yellow-700",
  },
};

export const Alert = ({
  variant = "info",
  title,
  message,
  onClose,
  className,
}: AlertProps) => {
  const { wrapper, icon, titleColor } = CONFIG[variant];

  return (
    <div
      className={twMerge(
        "flex items-start gap-3 rounded-2xl px-4 py-3.5 w-full",
        wrapper,
        className,
      )}
      role="alert"
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={twMerge("text-sm font-bold leading-snug", titleColor)}>
            {title}
          </p>
        )}
        <p className="text-sm text-[#475569] leading-snug mt-0.5">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-[#94a3b8] hover:text-[#475569] transition-colors mt-0.5"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "success";
  icon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  icon,
  isLoading = false,
  onConfirm,
}: ConfirmModalProps) {
  const getIconContainerClass = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-50 text-red-600 border border-red-200";
      case "success":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      default:
        return "bg-orange-50 text-[#f25c05] border border-orange-200";
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="w-5 h-5" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
      default:
        return "bg-[#f25c05] hover:bg-[#d94d04] text-white";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${getIconContainerClass()}`}
            >
              {icon || getDefaultIcon()}
            </div>
            <DialogTitle className="text-base font-bold text-[#112237]">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-xs text-[#64748b] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold h-10 px-4 cursor-pointer"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className={`rounded-xl text-xs font-bold h-10 px-5 shadow-sm transition-all cursor-pointer ${getConfirmButtonClass()}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

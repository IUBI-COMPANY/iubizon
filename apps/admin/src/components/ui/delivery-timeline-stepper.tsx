"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconTruck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface TimelineStepNode {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  icon?: React.ReactNode;
  badgeLabel?: string;
  badgeColor?: "emerald" | "orange" | "slate" | "amber";
  content?: React.ReactNode;
}

export interface DeliveryTimelineStepperProps {
  title?: string;
  titleIcon?: React.ReactNode;
  badgeLabel?: string;
  badgeVariant?: "default" | "orange" | "slate" | "emerald";
  steps: TimelineStepNode[];
  summaryContent?: React.ReactNode;
  mode?: "collapsible" | "modal" | "inline";
  modalTitle?: string;
  viewDetailsLabel?: string;
  hideDetailsLabel?: string;
  renderExtraActions?: () => React.ReactNode;
  className?: string;
}

export function DeliveryTimelineStepper({
  title = "Timeline de Flujo de Entrega",
  titleIcon,
  badgeLabel,
  badgeVariant = "slate",
  steps,
  summaryContent,
  mode = "collapsible",
  modalTitle,
  viewDetailsLabel = "Ver timeline detallado",
  hideDetailsLabel = "Ocultar detalles",
  renderExtraActions,
  className = "",
}: DeliveryTimelineStepperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStepIcon = (step: TimelineStepNode) => {
    if (step.status === "completed") {
      return <IconCheck className="w-3.5 h-3.5" />;
    }
    if (step.icon) {
      return step.icon;
    }
    return <IconTruck className="w-3.5 h-3.5" />;
  };

  const getBadgeClass = (color?: string) => {
    switch (color) {
      case "emerald":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "orange":
        return "text-[#f25c05] bg-orange-50 border-orange-200";
      case "amber":
        return "text-amber-800 bg-amber-50 border-amber-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  const renderHorizontalStepper = () => (
    <div className="flex items-center justify-between text-[11px] font-bold">
      {steps.map((step, idx) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        const textColorClass = isCompleted
          ? "text-emerald-700 font-bold"
          : isCurrent
            ? "text-[#f25c05] font-bold"
            : "text-slate-400";

        return (
          <React.Fragment key={step.id}>
            {idx > 0 && <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />}
            <div className={`flex items-center gap-1 ${textColorClass}`}>
              <div
                className={`flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full p-0.5"
                    : isCurrent
                      ? "animate-pulse"
                      : ""
                }`}
              >
                {getStepIcon(step)}
              </div>
              <span>{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderVerticalTimeline = () => (
    <div className="relative pl-6 space-y-4 pt-1 before:absolute before:left-2.5 before:top-4 before:bottom-3 before:w-0.5 before:bg-slate-300">
      {steps.map((step) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        const circleBgClass = isCompleted
          ? "bg-emerald-500 text-white"
          : isCurrent
            ? "bg-[#f25c05] text-white animate-pulse"
            : "bg-slate-300 text-slate-600";

        return (
          <div key={step.id} className="relative">
            <div
              className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${circleBgClass}`}
            >
              {getStepIcon(step)}
            </div>

            {step.content ? (
              step.content
            ) : (
              <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                {step.badgeLabel && (
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border ${getBadgeClass(
                      step.badgeColor,
                    )}`}
                  >
                    {step.badgeLabel}
                  </span>
                )}
                <p className="font-bold text-[#112237] text-xs mt-0.5">
                  {step.label}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3 text-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
          {titleIcon || <IconTruck className="w-4 h-4 text-[#f25c05]" />}
          <span>{title}</span>
        </p>

        {badgeLabel && (
          <Badge
            className={
              badgeVariant === "orange"
                ? "bg-orange-50 text-[#f25c05] border-orange-200 font-extrabold text-[10px]"
                : badgeVariant === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10px]"
                  : "bg-slate-100 text-slate-800 border-slate-200 font-extrabold text-[10px]"
            }
          >
            {badgeLabel}
          </Badge>
        )}
      </div>

      {/* Resumen Compacto de la Ruta (Card view) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2.5">
        {renderHorizontalStepper()}

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-700 font-medium flex-1">
            {summaryContent}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {renderExtraActions && renderExtraActions()}

            {mode === "collapsible" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-7 text-[11px] font-bold text-[#f25c05] hover:text-[#d94d04] hover:bg-orange-50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
              >
                <span>{isOpen ? hideDetailsLabel : viewDetailsLabel}</span>
                {isOpen ? (
                  <IconChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <IconChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            )}

            {mode === "modal" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="h-7 text-[11px] font-bold text-[#f25c05] hover:text-[#d94d04] hover:bg-orange-50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
              >
                <IconEye className="w-3.5 h-3.5" />
                <span>{viewDetailsLabel}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible View */}
      {mode === "collapsible" && isOpen && renderVerticalTimeline()}

      {/* Inline View */}
      {mode === "inline" && renderVerticalTimeline()}

      {/* Modal View */}
      {mode === "modal" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-6 border border-slate-200">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <DialogTitle className="text-base font-black text-[#112237] flex items-center gap-2">
                  {titleIcon || <IconTruck className="w-5 h-5 text-[#f25c05]" />}
                  <span>{modalTitle || title}</span>
                </DialogTitle>
                {badgeLabel && (
                  <Badge
                    className={
                      badgeVariant === "orange"
                        ? "bg-orange-50 text-[#f25c05] border-orange-200 font-extrabold text-[10px]"
                        : "bg-slate-100 text-slate-800 border-slate-200 font-extrabold text-[10px]"
                    }
                  >
                    {badgeLabel}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="pt-3">{renderVerticalTimeline()}</div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

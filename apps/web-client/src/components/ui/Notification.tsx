"use client";

import React, { useEffect, useState, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";
type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

interface Props {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  position?: NotificationPosition;
  onClose?: () => void;
  visible?: boolean;
}

export const Notification = ({
  type,
  title,
  message,
  duration = 5000,
  position = "top-left",
  onClose,
  visible = true,
}: Props) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      setIsExiting(false);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleClose]);

  if (!isVisible && !isExiting) return null;

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (type) {
      case "success":
        return <CheckCircle2 className={iconClass} />;
      case "error":
        return <XCircle className={iconClass} />;
      case "info":
        return <Info className={iconClass} />;
      case "warning":
        return <AlertTriangle className={iconClass} />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-400 text-green-800";
      case "error":
        return "bg-red-50 border-red-400 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-400 text-blue-800";
      case "warning":
        return "bg-yellow-50 border-yellow-400 text-yellow-800";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2";
    }
  };

  const getAnimationClasses = () => {
    if (isExiting) {
      return "animate-fade-out opacity-0 scale-95";
    }
    return "animate-fade-in";
  };

  return (
    <div
      className={twMerge(
        "fixed z-50 flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg max-w-md transition-all duration-300",
        getTypeClasses(),
        getPositionClasses(),
        getAnimationClasses(),
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Hook personalizado para usar notificaciones
export const useNotification = () => {
  const [notification, setNotification] = useState<{
    type: NotificationType;
    title?: string;
    message: string;
    visible: boolean;
  } | null>(null);

  const showNotification = (
    type: NotificationType,
    message: string,
    title?: string,
  ) => {
    setNotification({ type, message, title, visible: true });
  };

  const hideNotification = () => {
    setNotification((prev) => (prev ? { ...prev, visible: false } : null));
  };

  const NotificationComponent = notification ? (
    <Notification
      type={notification.type}
      title={notification.title}
      message={notification.message}
      visible={notification.visible}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
};

import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  message?: string;
  className?: string;
}

/**
 * Componente genérico para mensajes de error de formulario.
 * Solo se renderiza si hay un mensaje. Úsalo debajo de cualquier
 * campo que no muestre el error internamente (selects, grids de botones, rich text, etc.)
 */
export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn("mt-1 text-xs font-medium text-[#ef4444]", className)}
    >
      {message}
    </p>
  );
}

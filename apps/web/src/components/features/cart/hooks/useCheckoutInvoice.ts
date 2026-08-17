"use client";

import { useEffect, useState } from "react";
import type { InvoiceType, DocType } from "../InvoiceSelector";
import { INVOICE_STORAGE_KEY, TERMS_STORAGE_KEY } from "../checkout-schema";
import { useToast } from "@/context/ToastContext";

interface UseCheckoutInvoiceOptions {
  grandTotal: number;
  shippingForm: {
    documentType?: string;
    documentNumber?: string;
  };
}

export function useCheckoutInvoice({
  grandTotal,
  shippingForm,
}: UseCheckoutInvoiceOptions) {
  const toast = useToast();

  const [invoiceType, setInvoiceType] = useState<InvoiceType>("boleta");
  const [docType, setDocType] = useState<DocType>("dni");
  const [invoiceDni, setInvoiceDni] = useState("");
  const [invoiceRuc, setInvoiceRuc] = useState("");
  const [invoiceCompanyName, setInvoiceCompanyName] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);

  // Restaurar desde LocalStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInvoice = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (savedInvoice) {
        try {
          const parsed = JSON.parse(savedInvoice);
          if (parsed.invoiceType) setInvoiceType(parsed.invoiceType);
          if (parsed.docType) setDocType(parsed.docType);
          if (parsed.invoiceDni) setInvoiceDni(parsed.invoiceDni);
          if (parsed.invoiceRuc) setInvoiceRuc(parsed.invoiceRuc);
          if (parsed.invoiceCompanyName)
            setInvoiceCompanyName(parsed.invoiceCompanyName);
        } catch {}
      }

      const savedTerms = localStorage.getItem(TERMS_STORAGE_KEY);
      if (savedTerms) {
        try {
          const parsed = JSON.parse(savedTerms);
          if (typeof parsed.agreedToTerms === "boolean") {
            setAgreedToTerms(parsed.agreedToTerms);
          }
          if (typeof parsed.isOver18 === "boolean") {
            setIsOver18(parsed.isOver18);
          }
        } catch {}
      }
    }
  }, []);

  // Persistir comprobante en LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        INVOICE_STORAGE_KEY,
        JSON.stringify({
          invoiceType,
          docType,
          invoiceDni,
          invoiceRuc,
          invoiceCompanyName,
        }),
      );
    }
  }, [invoiceType, docType, invoiceDni, invoiceRuc, invoiceCompanyName]);

  // Persistir aceptación de términos y mayoría de edad en LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        TERMS_STORAGE_KEY,
        JSON.stringify({ agreedToTerms, isOver18 }),
      );
    }
  }, [agreedToTerms, isOver18]);

  const validateInvoiceDetails = (): boolean => {
    const docTypeValue = shippingForm.documentType;
    const docNumber = (shippingForm.documentNumber || "").trim();

    if (!docTypeValue || !docNumber) {
      toast.error(
        "Debes registrar un DNI (8) o RUC (11) válido del destinatario.",
        "Documento requerido",
      );
      return false;
    }

    if (invoiceType === "factura") {
      const cleanRuc = invoiceRuc.trim();
      if (!cleanRuc || cleanRuc.length !== 11) {
        toast.error(
          "El número de RUC es obligatorio y debe tener exactamente 11 dígitos para emitir Factura.",
          "Comprobante Requerido",
        );
        return false;
      }
      if (!invoiceCompanyName.trim()) {
        toast.error(
          "La Razón Social de la empresa es obligatoria para emitir Factura.",
          "Comprobante Requerido",
        );
        return false;
      }
    } else if (invoiceType === "boleta") {
      if (grandTotal > 700) {
        const cleanDni = invoiceDni.trim();
        if (!cleanDni || (docType === "dni" && cleanDni.length !== 8)) {
          toast.error(
            `El número de ${docType.toUpperCase()} es obligatorio para compras mayores a S/ 700 (Exigencia SUNAT).`,
            "Comprobante Requerido",
          );
          return false;
        }
      }
    }
    return true;
  };

  const validateCheckout = (): boolean => {
    if (!validateInvoiceDetails()) return false;

    if (!agreedToTerms) {
      toast.error(
        "Debes aceptar los Términos y Condiciones para continuar.",
        "Aceptación requerida",
      );
      return false;
    }

    if (!isOver18) {
      toast.error(
        "Debes confirmar que eres mayor de 18 años para continuar.",
        "Confirmación requerida",
      );
      return false;
    }

    return true;
  };

  return {
    invoiceType,
    setInvoiceType,
    docType,
    setDocType,
    invoiceDni,
    setInvoiceDni,
    invoiceRuc,
    setInvoiceRuc,
    invoiceCompanyName,
    setInvoiceCompanyName,
    agreedToTerms,
    setAgreedToTerms,
    isOver18,
    setIsOver18,
    validateInvoiceDetails,
    validateCheckout,
  };
}

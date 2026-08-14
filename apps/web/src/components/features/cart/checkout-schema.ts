import { z } from "zod";

export const STEP_STORAGE_KEY = "iubizon_checkout_step";
export const FORM_STORAGE_KEY = "iubizon_checkout_form";
export const INVOICE_STORAGE_KEY = "iubizon_checkout_invoice";
export const TERMS_STORAGE_KEY = "iubizon_checkout_terms";

export type DeliveryType = "progressive" | "complete";

/** Compone el texto de ubicación mostrado al vendedor a partir del ubigeo elegido. */
export const buildCityLabel = (
  department: string,
  province: string,
  district: string,
): string => {
  return [district, province, department].filter(Boolean).join(", ");
};

export const shippingFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre completo es obligatorio."),
    phone: z
      .string()
      .trim()
      .min(6, "Ingresa un teléfono/WhatsApp de contacto válido."),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    address: z
      .string()
      .trim()
      .min(1, "La dirección completa de entrega es obligatoria."),
    department: z.string().min(1, "Selecciona un departamento."),
    province: z.string().min(1, "Selecciona una provincia."),
    district: z.string().min(1, "Selecciona un distrito."),
    documentType: z.enum(["dni", "ruc"], {
      message: "Selecciona DNI o RUC del destinatario.",
    }),
    documentNumber: z
      .string()
      .trim()
      .min(1, "El número de documento es obligatorio."),
    /** Derivado de departamento/provincia/distrito. Se mantiene por compatibilidad
     * con la construcción de destination_address y las plantillas de correo. */
    city: z.string(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const docNumber = (data.documentNumber || "").trim();
    const isDniValid = data.documentType === "dni" && /^\d{8}$/.test(docNumber);
    const isRucValid =
      data.documentType === "ruc" && /^\d{11}$/.test(docNumber);
    if (!isDniValid && !isRucValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentNumber"],
        message:
          data.documentType === "dni"
            ? "El DNI debe tener exactamente 8 dígitos."
            : "El RUC debe tener exactamente 11 dígitos.",
      });
    }
  });

export type ShippingFormState = z.infer<typeof shippingFormSchema>;

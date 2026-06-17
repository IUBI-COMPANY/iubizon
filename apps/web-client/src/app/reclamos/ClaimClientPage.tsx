"use client";

import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useFormUtils } from "@/hooks/useFormUtils";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Form } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import * as yup from "yup";
import type { ObjectSchema } from "yup";
import { SendIcon } from "lucide-react";
import countriesISO from "@/data-list/countriesISO.json";
import { sendClaimEmail } from "./actions";
import { Alert } from "@/components/ui/Alert";

// Tipo para el formulario (estructura plana)
type ClaimFormData = {
  fullName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phonePrefix: string;
  phoneNumber: string;
  email: string;
  incidentDate: string;
  incidentTime?: string;
  purchaseDate: string;
  invoiceNumber: string;
  claimMotive: string;
  productServiceDescription?: string;
  problemDescription: string;
  claimedAmount?: string;
  requestedSolution: string;
};

const schema: ObjectSchema<ClaimFormData> = yup.object({
  fullName: yup
    .string()
    .required("El nombre completo es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  documentType: yup.string().required("Selecciona un tipo de documento"),
  documentNumber: yup
    .string()
    .required("El número de documento es requerido")
    .when("documentType", {
      is: "DNI",
      then: (schema) =>
        schema
          .matches(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos")
          .length(8, "El DNI debe tener exactamente 8 dígitos"),
      otherwise: (schema) => schema,
    })
    .when("documentType", {
      is: "NIE",
      then: (schema) =>
        schema
          .matches(
            /^[XYZ]\d{7}[A-Z]$/i,
            "El NIE debe tener el formato X1234567A",
          )
          .length(9, "El NIE debe tener 9 caracteres"),
      otherwise: (schema) => schema,
    })
    .when("documentType", {
      is: "Pasaporte",
      then: (schema) =>
        schema
          .matches(
            /^[A-Z0-9]{6,9}$/i,
            "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos",
          )
          .min(6, "El pasaporte debe tener al menos 6 caracteres")
          .max(9, "El pasaporte debe tener máximo 9 caracteres"),
      otherwise: (schema) => schema,
    })
    .when("documentType", {
      is: "CE",
      then: (schema) =>
        schema
          .matches(/^\d{9}$/, "La Cédula de Extranjería debe tener 9 dígitos")
          .length(9, "La Cédula de Extranjería debe tener 9 dígitos"),
      otherwise: (schema) => schema,
    }),
  address: yup
    .string()
    .required("La dirección es requerida")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  phonePrefix: yup.string().required("Selecciona un prefijo"),
  phoneNumber: yup
    .string()
    .required("El teléfono es requerido")
    .test("phone-validation", function (value) {
      const { phonePrefix } = this.parent;
      if (!value) return true;

      const country = countriesISO.find((c) => c.phonePrefix === phonePrefix);
      if (!country || !country.regex) {
        return this.createError({
          message: "El número de teléfono no es válido",
        });
      }

      const regex = new RegExp(country.regex);
      if (!regex.test(value)) {
        return this.createError({
          message: `El número no cumple con el formato válido para ${country.name}`,
        });
      }

      return true;
    }),
  email: yup
    .string()
    .email("Ingresa un correo válido")
    .required("El correo electrónico es requerido"),
  incidentDate: yup.string().required("La fecha del incidente es requerida"),
  incidentTime: yup.string().optional(),
  purchaseDate: yup
    .string()
    .required("La fecha de compra/contratación es requerida"),
  invoiceNumber: yup
    .string()
    .required("El número de factura/ticket es requerido"),
  claimMotive: yup.string().required("Selecciona un motivo"),
  productServiceDescription: yup.string().when("claimMotive", {
    is: "producto",
    then: (schema) =>
      schema
        .required("El producto es requerido")
        .min(3, "Proporciona más detalles"),
    otherwise: (schema) => schema.optional(),
  }),
  problemDescription: yup
    .string()
    .required("Describe el problema")
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  claimedAmount: yup.string().optional(),
  requestedSolution: yup.string().required("Selecciona una solución"),
}) as ObjectSchema<ClaimFormData>;

export default function ClaimClientPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<ClaimFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      documentType: "DNI",
      documentNumber: "",
      address: "",
      email: "",
      incidentDate: "",
      incidentTime: "",
      purchaseDate: "",
      invoiceNumber: "",
      claimMotive: "producto",
      productServiceDescription: "",
      problemDescription: "",
      claimedAmount: "",
      requestedSolution: "",
      phonePrefix: "+51",
      phoneNumber: "",
    },
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });
  const claimMotive = watch("claimMotive");

  // Función para transformar los datos del formulario a la estructura ContactViaEmail
  const transformFormData = (data: ClaimFormData): Partial<Email> => {
    const nameParts = data.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      hostname: "iubizon.com",
      termsAndConditions: true,
      type: "claim",
      contactInfo: {
        firstName: firstName,
        lastName: lastName,
        fullName: data.fullName,
        email: data.email,
        phone: {
          prefix: data.phonePrefix,
          number: data.phoneNumber,
        },
        document: {
          type: data.documentType as DocumentInfo["type"],
          number: data.documentNumber,
        },
        address: data.address,
      },
      claimDetails: {
        incidentDate: data.incidentDate,
        incidentTime: data.incidentTime || "",
        purchaseDate: data.purchaseDate,
        invoiceNumber: data.invoiceNumber,
        claimMotive: data.claimMotive,
        productServiceDescription: data.productServiceDescription || "",
        problemDescription: data.problemDescription,
        claimedAmount: data.claimedAmount || "",
        requestedSolution: data.requestedSolution,
      },
    };
  };

  const onSubmit = async (data: ClaimFormData) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const claimData = transformFormData(data);
      const result = await sendClaimEmail(claimData);
      setLoading(false);
      if (result.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(result.error || "Ocurrió un error al enviar el reclamo.");
      }
    } catch (e) {
      setLoading(false);
      const details = e instanceof Error ? e.message : String(e);
      setErrorMsg(
        "Ocurrió un error inesperado. Intenta nuevamente. " + details,
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-6">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-2xl p-8 border border-green-300">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            ¡Reclamo Registrado Exitosamente!
          </h2>
          <p className="text-lg text-foreground mb-6">
            Tu reclamo ha sido recibido y será procesado en breve.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Te contactaremos a través del email y teléfono proporcionados dentro
            de 5 días hábiles.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              reset();
            }}
            variant="primary"
            size="md"
          >
            Enviar Otro Reclamo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Libro de Reclamaciones
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
          <p className="text-lg leading-relaxed text-foreground">
            Formulario oficial para presentar tus reclamos y quejas. Por favor,
            completa todos los campos con información verídica.
          </p>
        </div>

        {/* INFORMACIÓN DE LA EMPRESA */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Datos de la Empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Razón Social:</p>
              <p className="text-secondary">IUBIZON COMPANY SAC</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">RUC:</p>
              <p className="text-secondary">20614600374</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 font-semibold">Dirección:</p>
              <p className="text-secondary">
                Calle las acacias, Pje. los Jazmines 181, Chorrillos, Lima
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Teléfono:</p>
              <p className="text-secondary">972 300 301</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Correo:</p>
              <p className="text-secondary">iubizon.company@gmail.com</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Horario:</p>
              <p className="text-secondary">Lun-Vie 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-primary/20 p-8">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-4">
              {/* SECCIÓN 1: DATOS DEL RECLAMANTE */}
              <div className="md:col-span-4">
                <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b">
                  1. Datos del Reclamante
                </h2>
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Nombre Completo"
                      placeholder="Tu nombre completo"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      autoComplete="name"
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Tipo de Documento"
                      placeholder="Selecciona un tipo"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      options={[
                        { label: "DNI", value: "DNI" },
                        { label: "NIE", value: "NIE" },
                        { label: "Pasaporte", value: "Pasaporte" },
                        { label: "Cédula de Extranjería", value: "CE" },
                      ]}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <Controller
                  name="documentNumber"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Número de Documento"
                      placeholder="Ej: 75XXXXXX"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <Controller
                  name="phonePrefix"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Prefijo"
                      placeholder="País"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      options={countriesISO.map((iso) => ({
                        label: `${iso.name} (${iso.phonePrefix})`,
                        value: iso.phonePrefix,
                      }))}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Teléfono"
                      placeholder="Número"
                      type="text"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Correo Electrónico"
                      placeholder="tuemail@ejemplo.com"
                      type="email"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      autoComplete="email"
                    />
                  )}
                />
              </div>

              <div className="md:col-span-4">
                <Controller
                  name="address"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Dirección Domiciliaria"
                      placeholder="Tu domicilio actual y habitual"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      autoComplete="street-address"
                    />
                  )}
                />
              </div>

              {/* SECCIÓN 2: DETALLES DE LA RECLAMACIÓN */}
              <div className="md:col-span-4">
                <h2 className="text-2xl font-bold text-secondary mb-6 mt-6 pb-4 border-b border-t pt-4">
                  2. Detalles de la Reclamación
                </h2>
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="incidentDate"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <DatePicker
                      label="Fecha del Incidente"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="incidentTime"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <TimePicker
                      label="Hora del Incidente"
                      placeholder="HH:MM"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <DatePicker
                      label="Fecha de Compra/Contratación"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="invoiceNumber"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Número de Factura/Ticket/Orden"
                      placeholder="Ej: FAC-001, TKT-2024-001"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="claimMotive"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Motivo del Reclamo"
                      placeholder="Selecciona un motivo"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      options={[
                        { label: "Producto", value: "producto" },
                        { label: "Servicio", value: "servicio" },
                      ]}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="requestedSolution"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Solución Esperada"
                      placeholder="Selecciona una opción"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      options={[
                        { label: "Reembolso", value: "reembolso" },
                        { label: "Cambio de producto", value: "cambio" },
                        { label: "Reparación", value: "reparacion" },
                        { label: "Descuento", value: "descuento" },
                        { label: "Otra solución", value: "otro" },
                      ]}
                    />
                  )}
                />
              </div>

              {claimMotive === "producto" && (
                <div className="md:col-span-4">
                  <Controller
                    name="productServiceDescription"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Input
                        label="Especifica el Producto"
                        placeholder="Ej: Proyector Epson PowerLite 980W, Número de serie, etc."
                        name={name}
                        value={value}
                        error={error(name)}
                        helperText={errorMessage(name)}
                        required={required(name)}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              )}

              <div className="md:col-span-4">
                <Controller
                  name="problemDescription"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <TextArea
                      label="Descripción del Problema"
                      placeholder="Describe los hechos de manera clara, concisa y cronológica"
                      rows={5}
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-4">
                <Controller
                  name="claimedAmount"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Monto Reclamado (S/)"
                      placeholder="Si aplica, monto en soles"
                      type="number"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              {errorMsg && (
                <div className="md:col-span-4">
                  <Alert type="error" message={errorMsg} />
                </div>
              )}

              <div className="md:col-span-4">
                <Button type="submit" block loading={loading}>
                  <div className="flex gap-2 items-center leading-1">
                    <SendIcon className="w-[1.2em]" /> Registrar Reclamo
                  </div>
                </Button>
              </div>

              <div className="md:col-span-4">
                <p className="text-xs text-gray-500 text-center">
                  * Campos obligatorios. Tu número de reclamo será generado tras
                  enviar este formulario.
                </p>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

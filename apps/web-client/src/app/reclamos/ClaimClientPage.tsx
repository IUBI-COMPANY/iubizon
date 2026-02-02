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
import { sendReclamation } from "./actions";
import { Alert } from "@/components/ui/Alert";

// Tipo para el formulario (estructura plana)
type ClaimFormData = {
  full_name: string;
  document_type: string;
  document_id: string;
  address: string;
  phone_prefix: string;
  phone_number: string;
  email: string;
  incident_date: string;
  incident_time?: string;
  purchase_date: string;
  invoice_number: string;
  claim_motive: string;
  product_service_description?: string;
  problem_description: string;
  claimed_amount?: string;
  requested_solution: string;
};

const schema: ObjectSchema<ClaimFormData> = yup.object({
  full_name: yup
    .string()
    .required("El nombre completo es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  document_type: yup.string().required("Selecciona un tipo de documento"),
  document_id: yup.string().required("El número de documento es requerido"),
  address: yup
    .string()
    .required("La dirección es requerida")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  phone_prefix: yup.string().required("Selecciona un prefijo"),
  phone_number: yup.string().required("El teléfono es requerido"),
  email: yup
    .string()
    .email("Ingresa un correo válido")
    .required("El correo electrónico es requerido"),
  incident_date: yup.string().required("La fecha del incidente es requerida"),
  incident_time: yup.string().optional(),
  purchase_date: yup
    .string()
    .required("La fecha de compra/contratación es requerida"),
  invoice_number: yup
    .string()
    .required("El número de factura/ticket es requerido"),
  claim_motive: yup.string().required("Selecciona un motivo"),
  product_service_description: yup.string().when("claim_motive", {
    is: "producto",
    then: (schema) =>
      schema
        .required("El producto es requerido")
        .min(3, "Proporciona más detalles"),
    otherwise: (schema) => schema.optional(),
  }),
  problem_description: yup
    .string()
    .required("Describe el problema")
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  claimed_amount: yup.string().optional(),
  requested_solution: yup.string().required("Selecciona una solución"),
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
      full_name: "",
      document_type: "DNI",
      document_id: "",
      address: "",
      email: "",
      incident_date: "",
      incident_time: "",
      purchase_date: "",
      invoice_number: "",
      claim_motive: "producto",
      product_service_description: "",
      problem_description: "",
      claimed_amount: "",
      requested_solution: "",
      phone_prefix: "+51",
      phone_number: "",
    },
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });
  const claimMotive = watch("claim_motive");

  // Función para transformar los datos del formulario a la estructura ClaimForIubizon
  const transformFormData = (data: ClaimFormData): ClaimForIubizon => {
    const nameParts = data.full_name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      client_id: "gYn8QUB8g35wEAZcZz7D",
      contact: {
        first_name: firstName,
        last_name: lastName,
        full_name: data.full_name,
        email: data.email,
        phone: {
          prefix: data.phone_prefix,
          number: data.phone_number,
        },
      },
      document: {
        type: data.document_type as DocumentInfo["type"],
        number: data.document_id,
      },
      details: {
        incident_date: data.incident_date,
        incident_time: data.incident_time || "",
        purchase_date: data.purchase_date,
        invoice_number: data.invoice_number,
        claim_motive: data.claim_motive,
        product_service_description: data.product_service_description || "",
        problem_description: data.problem_description,
        claimed_amount: data.claimed_amount || "",
        requested_solution: data.requested_solution,
      },
    };
  };

  const onSubmit = async (data: ClaimFormData) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const claimData = transformFormData(data);
      const result = await sendReclamation(claimData);
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
              <p className="text-secondary">contacto@iubizon.com</p>
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
                  name="full_name"
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
                  name="document_type"
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
                  name="document_id"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Número de Documento"
                      placeholder="Ej: 12345678"
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
                  name="phone_prefix"
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
                  name="phone_number"
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
                  name="incident_date"
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
                  name="incident_time"
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
                  name="purchase_date"
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
                  name="invoice_number"
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
                  name="claim_motive"
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
                  name="requested_solution"
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
                    name="product_service_description"
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
                  name="problem_description"
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
                  name="claimed_amount"
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

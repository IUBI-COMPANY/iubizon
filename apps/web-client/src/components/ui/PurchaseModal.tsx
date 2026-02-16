"use client";

import React, { useState } from "react";
import * as yup from "yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { X, Check, Loader2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFormUtils } from "@/hooks/useFormUtils";
import countriesISO from "@/data-list/countriesISO.json";
import documentsTypes from "@/data-list/documentsTypes.json";
import { Product } from "@/data-list/products";
import { sendPurchaseLead } from "./purchaseActions";
import { useNotification } from "@/components/ui/Notification";

interface FormData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  company?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const PurchaseModal = ({ isOpen, onClose, product }: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    documentType: yup.string().required("El tipo de documento es requerido"),
    documentNumber: yup
      .string()
      .required("El número de documento es requerido")
      .test("is-valid-doc", "Número de documento inválido", function (value) {
        const { documentType } = this.parent;
        if (documentType === "DNI") {
          return /^\d{8}$/.test(value);
        } else if (documentType === "RUC") {
          return /^(10|20)\d{9}$/.test(value);
        }
        return true;
      }),
    firstName: yup.string().required("El nombre es requerido"),
    lastName: yup.string().required("El apellido es requerido"),
    email: yup
      .string()
      .email("Email inválido")
      .required("El email es requerido"),
    phonePrefix: yup.string().required("El prefijo es requerido"),
    phoneNumber: yup.string().required("El teléfono es requerido"),
    company: yup.string().when("documentType", {
      is: "RUC",
      then: (schema) => schema.required("La razón social es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      documentType: "",
      documentNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      phonePrefix: "+51",
      phoneNumber: "",
      company: "",
    },
  });

  const documentType = watch("documentType");
  const isRuc = documentType === "RUC";
  const isDni = documentType === "DNI";

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    const leadData: Lead = {
      leadType: "sale",
      clientType: isRuc ? "organization" : "individual",
      status: "new",
      archived: false,
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        socialReason: isRuc ? formData.company : undefined,
        email: formData.email,
        phone: {
          prefix: formData.phonePrefix,
          number: formData.phoneNumber,
        },
      },
      document: {
        type: formData.documentType as DocumentInfo["type"],
        number: formData.documentNumber,
      },
      serviceDetails: {
        products: [
          {
            id: product.id,
            name: product.name || product.model,
            quantity: 1,
            brand: product.brand || "iubizon",
            model: product.model,
          },
        ],
      },
      termsAndConditions: true,
      isQuoteRequest: false,
      hostname: "iubizon.com",
      tracking: {
        source: "website",
        landingPage: window.location.href,
      },
    };

    try {
      await sendPurchaseLead(leadData);
      setLoading(false);
      setSuccess(true);
      reset();
    } catch (error) {
      console.error("Error sending purchase lead: ", error);
      setLoading(false);
      showNotification(
        "error",
        "Hubo un error al procesar tu compra. Por favor, inténtelo nuevamente.",
        "Error al procesar",
      );
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuccess(false);
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-primary/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Screen */}
        {success ? (
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-3 font-sfpro">
                ¡Compra Procesada!
              </h3>
              <p className="text-gray-300 text-lg font-sfpro">
                Hemos recibido tu solicitud de compra
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
              <p className="text-white text-sm leading-relaxed font-sfpro">
                📧 Te hemos enviado un correo de confirmación con los detalles
                de tu compra.
              </p>
              <p className="text-gray-300 text-sm mt-3 font-sfpro">
                Nuestro equipo se pondrá en contacto contigo pronto para
                coordinar el pago y la entrega.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all font-sfpro"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 flex items-center justify-between border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-sfpro">
                    Finalizar Compra
                  </h2>
                  <p className="text-sm text-white/80 font-sfpro">
                    {product.name || product.model}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 md:p-8 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Tipo de Documento"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder="Seleccionar"
                      options={documentsTypes}
                      textColor="white"
                    />
                  )}
                />
                <Controller
                  name="documentNumber"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="N° de Documento"
                      type="text"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder={
                        isRuc
                          ? "10XXXXXXXXX o 20XXXXXXXXX"
                          : isDni
                            ? "71XXXXXX"
                            : "Ingresa el número"
                      }
                    />
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Nombres"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder="Juan"
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Apellidos"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder="Pérez"
                    />
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Input
                    label="Correo electrónico"
                    type="email"
                    name={name}
                    value={value}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={onChange}
                    placeholder="juan@empresa.com"
                  />
                )}
              />

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Controller
                    name="phonePrefix"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <label className="block text-sm/6 font-semibold text-white mb-1.5">
                          Prefijo
                          <span className="text-red-400 ml-1">*</span>
                        </label>
                        <select
                          value={value}
                          onChange={onChange}
                          className="block w-full rounded-md bg-white px-3 py-2 text-base transition-colors duration-200 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-secondary/70 hover:outline-gray-400"
                        >
                          {countriesISO.map((country) => (
                            <option
                              key={country.alpha2}
                              value={country.phonePrefix}
                            >
                              {country.phonePrefix}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Input
                        label="Teléfono / WhatsApp"
                        type="tel"
                        placeholder="999 999 999"
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
              </div>

              {isRuc && (
                <Controller
                  name="company"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Razón Social / Empresa"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder="Mi Empresa S.A.C."
                    />
                  )}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-sfpro"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando compra...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Confirmar compra
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
      {NotificationComponent}
    </div>
  );
};

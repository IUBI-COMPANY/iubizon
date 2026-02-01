"use client";

import React, { useEffect, useRef } from "react";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Form } from "@/components/ui/Form";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import countriesISO from "@/data-list/countriesISO.json";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SaleForOrgStep2 } from "@/app/productos/organizaciones/StepsGroup";

interface FormData {
  document_type: string;
  document_number: string;
  company_name?: string; // Opcional: solo requerido si document_type === "RUC"
  first_name?: string; // Opcional: solo requerido si document_type !== "RUC"
  last_name?: string; // Opcional: solo requerido si document_type !== "RUC"
  email: string;
  phone_prefix: string;
  phone_number: string;
}

interface Props {
  globalStep: number;
  productFormData: Partial<SaleForOrgStep2>;
  setProductFormData: (data: Partial<SaleForOrgStep2>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const ContactOrgInfoStep2 = ({
  globalStep,
  productFormData,
  setProductFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const previousDocType = useRef<string | undefined>("");

  const schema = yup.object({
    document_type: yup.string().required(),
    document_number: yup
      .string()
      .required()
      .test("is-valid-doc", "Número de documento inválido", function (value) {
        const { document_type } = this.parent;
        if (document_type === "DNI") {
          return /^\d{8}$/.test(value);
        } else if (document_type === "RUC") {
          return /^(10|20)\d{9}$/.test(value);
        }
        return true;
      }),
    company_name: yup.string().when("document_type", {
      is: "RUC",
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
    first_name: yup.string().when("document_type", {
      is: "RUC",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(),
    }),
    last_name: yup.string().when("document_type", {
      is: "RUC",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(),
    }),
    email: yup.string().email().required(),
    phone_prefix: yup.string().required(),
    phone_number: yup
      .string()
      .required()
      .test("is-valid-phone", "Número de teléfono inválido", function (value) {
        const { phone_prefix } = this.parent;
        return regexPhoneByCountries(phone_prefix).test(value);
      }),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: productFormData?.document?.type || undefined,
      document_number: productFormData?.document?.number || "",
      company_name: productFormData?.organization_info?.company_name || "",
      first_name: productFormData?.contact?.first_name || "",
      last_name: productFormData?.contact?.last_name || "",
      email: productFormData?.contact?.email || "",
      phone_prefix: productFormData?.contact?.phone?.prefix || "+51",
      phone_number: productFormData?.contact?.phone?.number || "",
    },
  });

  const docType = watch("document_type");
  const isRuc = docType === "RUC";
  const isDni = docType === "DNI";

  // Limpiar campos cuando cambia el tipo de documento
  useEffect(() => {
    if (previousDocType.current && previousDocType.current !== docType) {
      setValue("document_number", "");

      if (docType === "RUC") {
        setValue("first_name", "");
        setValue("last_name", "");
      } else if (docType === "DNI") {
        setValue("company_name", "");
      } else {
        setValue("first_name", "");
        setValue("last_name", "");
        setValue("company_name", "");
      }
    }
    previousDocType.current = docType;
  }, [docType, setValue]);

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const regexPhoneByCountries = (phone_prefix: string) => {
    const country = countriesISO.find(
      (country) => country.phonePrefix === phone_prefix,
    );
    const regex = country?.regex || "^\\d{4,}$";
    return new RegExp(regex);
  };

  const onSubmit = (formData: FormData) => {
    const completeFormData: SaleForOrgStep2 = {
      contact: {
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        email: formData.email,
        phone: {
          prefix: formData.phone_prefix,
          number: formData.phone_number,
        },
      },
      document: {
        type: formData.document_type as DocumentInfo["type"],
        number: formData.document_number,
      },
      client_type:
        formData.document_type === "RUC" ? "organization" : "individual",
    };

    // Si es RUC, agregar información de organización
    if (formData.document_type === "RUC") {
      completeFormData.organization_info = {
        company_name: formData.company_name,
        tax_id: formData.document_number,
      };
      completeFormData.contact.social_reason = formData.company_name;
    } else {
      completeFormData.contact.full_name =
        `${formData.first_name} ${formData.last_name}`.trim();
    }

    setProductFormData({ ...productFormData, ...completeFormData });
    addLocalStorageData(completeFormData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Datos de contacto
      </div>
      <div className="mt-5">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 mx-auto max-w-xl">
            <div className="grid grid-cols-1 gap-x-2 gap-y-6 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Controller
                  name="document_type"
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
                      options={[
                        { label: "RUC", value: "RUC" },
                        { label: "DNI", value: "DNI" },
                        { label: "CE (Carnet de Extranjería)", value: "CE" },
                        { label: "Pasaporte", value: "PASSPORT" },
                        { label: "Otro", value: "OTHER" },
                      ]}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  name="document_number"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="N° de Documento"
                      type="number"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder={
                        isRuc
                          ? "10XXXXXXXX"
                          : isDni
                            ? "71XXXXX"
                            : "Ingresa el número"
                      }
                    />
                  )}
                />
              </div>
              {isRuc ? (
                <div className="sm:col-span-4">
                  <Controller
                    name="company_name"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Input
                        label="Razón Social"
                        name={name}
                        value={value}
                        error={error(name)}
                        helperText={errorMessage(name)}
                        required={required(name)}
                        onChange={onChange}
                        placeholder="EJEMPLO S.A.C."
                      />
                    )}
                  />
                </div>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <Controller
                      name="first_name"
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
                          placeholder="Tus nombres"
                        />
                      )}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Controller
                      name="last_name"
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
                          placeholder="Tus apellidos"
                        />
                      )}
                    />
                  </div>
                </>
              )}
              <div className="sm:col-span-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Correo Electrónico"
                      name={name}
                      type="email"
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      placeholder="ejemplo@dominio.com"
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  name="phone_prefix"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Select
                      label="Prefijo"
                      placeholder="Selecciona un país"
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
              <div className="sm:col-span-3">
                <Controller
                  name="phone_number"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Teléfono"
                      placeholder="9XXXXXXXX"
                      type="number"
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
            <div className="flex flex-row justify-between gap-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => setCurrentStepToLocalStorage(globalStep - 1)}
              >
                <div className="flex gap-2 items-center justify-center">
                  <ArrowLeft /> <span>Atrás</span>
                </div>
              </Button>
              <Button block variant="primary" type="submit">
                <div className="flex gap-2 items-center justify-center">
                  <span>Siguiente</span> <ArrowRight />
                </div>
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

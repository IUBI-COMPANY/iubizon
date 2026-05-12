"use client";

import React, { useEffect, useRef } from "react";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";
import { FormSelect as Select } from "@/components/ui/FormSelect";
import { Form } from "@/components/ui/Form";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import countriesISO from "@/data-list/countriesISO.json";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnOrderStep2 } from "@/app/productos/pedido/StepsGroup";
import documentsTypes from "@/data-list/documentsTypes.json";

interface FormData {
  documentType: string;
  documentNumber: string;
  companyName?: string; // Opcional: solo requerido si documentType === "RUC"
  firstName?: string; // Opcional: solo requerido si documentType !== "RUC"
  lastName?: string; // Opcional: solo requerido si documentType !== "RUC"
  email: string;
  phonePrefix: string;
  phoneNumber: string;
}

interface Props {
  globalStep: number;
  leadFormData: Partial<Lead>;
  setLeadFormData: (data: Partial<Lead>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const ContactInfoStep2 = ({
  globalStep,
  leadFormData,
  setLeadFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const previousDocType = useRef<string | undefined>("");

  const schema = yup.object({
    documentType: yup.string().required(),
    documentNumber: yup
      .string()
      .required()
      .test("is-valid-doc", "Número de documento inválido", function (value) {
        const { documentType } = this.parent;
        if (documentType === "DNI") {
          return /^\d{8}$/.test(value);
        } else if (documentType === "RUC") {
          return /^(10|20)\d{9}$/.test(value);
        }
        return true;
      }),
    companyName: yup.string().when("documentType", {
      is: "RUC",
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
    firstName: yup.string().when("documentType", {
      is: "RUC",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(),
    }),
    lastName: yup.string().when("documentType", {
      is: "RUC",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(),
    }),
    email: yup.string().email().required(),
    phonePrefix: yup.string().required(),
    phoneNumber: yup
      .string()
      .required()
      .test("is-valid-phone", "Número de teléfono inválido", function (value) {
        const { phonePrefix } = this.parent;
        return regexPhoneByCountries(phonePrefix).test(value);
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
      documentType: leadFormData?.document?.type || undefined,
      documentNumber: leadFormData?.document?.number || "",
      companyName: leadFormData?.organizationInfo?.legalName || "",
      firstName: leadFormData?.contact?.firstName || "",
      lastName: leadFormData?.contact?.lastName || "",
      email: leadFormData?.contact?.email || "",
      phonePrefix: leadFormData?.contact?.phone?.prefix || "+51",
      phoneNumber: leadFormData?.contact?.phone?.number || "",
    },
  });

  const docType = watch("documentType");
  const isRuc = docType === "RUC";
  const isDni = docType === "DNI";

  // Limpiar campos cuando cambia el tipo de documento
  useEffect(() => {
    if (previousDocType.current && previousDocType.current !== docType) {
      setValue("documentNumber", "");

      if (docType === "RUC") {
        setValue("firstName", "");
        setValue("lastName", "");
      } else if (docType === "DNI") {
        setValue("companyName", "");
      } else {
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("companyName", "");
      }
    }
    previousDocType.current = docType;
  }, [docType, setValue]);

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const regexPhoneByCountries = (phonePrefix: string) => {
    const country = countriesISO.find(
      (country) => country.phonePrefix === phonePrefix,
    );
    const regex = country?.regex || "^\\d{4,}$";
    return new RegExp(regex);
  };

  const onSubmit = (formData: FormData) => {
    const completeFormData: AnOrderStep2 = {
      contact: {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
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
      clientType:
        formData.documentType === "RUC" ? "organization" : "individual",
    };

    // Si es RUC, agregar información de organización
    if (formData.documentType === "RUC") {
      completeFormData.organizationInfo = {
        companyName: formData.companyName,
        taxId: formData.documentNumber,
      };
      completeFormData.contact.socialReason = formData.companyName;
    }

    setLeadFormData({ ...leadFormData, ...completeFormData });
    addLocalStorageData(completeFormData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Datos de contacto de la {isRuc ? "empresa" : "persona"}
      </div>
      <div className="mt-5">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 mx-auto max-w-xl">
            <div className="grid grid-cols-1 gap-x-2 gap-y-6 sm:grid-cols-4">
              <div className="sm:col-span-2">
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
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  name="documentNumber"
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
                          ? "20XXXXXXXX"
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
                    name="companyName"
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
                          placeholder="Tus nombres"
                        />
                      )}
                    />
                  </div>
                  <div className="sm:col-span-2">
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
                  name="phonePrefix"
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
                  name="phoneNumber"
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

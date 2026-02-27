"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import * as yup from "yup";
import { Form } from "@/components/ui/Form";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import { Select } from "@/components/ui/Select";
import countriesISO from "@/data-list/countriesISO.json";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ServiceForPersonStep2 } from "@/app/servicios/tecnico/persona/StepsGroup";
import documentsTypes from "@/data-list/documentsTypes.json";

interface FormData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
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
  current?: number;
  hideControls?: boolean;
}

export const ContactPersonInfoStep2 = ({
  globalStep,
  leadFormData,
  setLeadFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const regexPhoneByCountries = (phonePrefix: string) => {
    const country = countriesISO.find(
      (country) => country.phonePrefix === phonePrefix,
    );
    const regex = country?.regex || "^\\d{4,}$";
    return new RegExp(regex);
  };

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
        } else if (documentType === "CE") {
          return /^\d{9,12}$/.test(value);
        } else if (documentType === "PASSPORT") {
          return /^[A-Z0-9]{6,9}$/.test(value);
        }
        return true;
      }),
    firstName: yup.string().required("Nombres requeridos"),
    lastName: yup.string().required("Apellidos requeridos"),
    email: yup.string().email("Email inválido").required("Email requerido"),
    phonePrefix: yup.string().required("Prefijo requerido"),
    phoneNumber: yup
      .string()
      .required("Teléfono requerido")
      .test("is-valid-phone", "Número de teléfono inválido", function (value) {
        const { phonePrefix } = this.parent;
        return regexPhoneByCountries(phonePrefix).test(value);
      }),
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      documentType: leadFormData?.document?.type || undefined,
      documentNumber: leadFormData?.document?.number || "",
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

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = (formData: FormData) => {
    const completeFormData: ServiceForPersonStep2 = {
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
      clientType: "individual",
    };

    setLeadFormData({ ...leadFormData, ...completeFormData });
    addLocalStorageData(completeFormData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Datos de contacto de la persona
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
                      textColor="secondary"
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
                      textColor="secondary"
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
              <div className="sm:col-span-2">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Nombres"
                      textColor="secondary"
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
                      textColor="secondary"
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
              <div className="sm:col-span-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Email"
                      textColor="secondary"
                      name={name}
                      value={value}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      onChange={onChange}
                      type="email"
                      required={required(name)}
                      placeholder="tucorreo@ejemplo.com"
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
                      textColor="secondary"
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
                      textColor="secondary"
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

"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import * as yup from "yup";
import { Form } from "@/components/ui/Form";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import { Select } from "@/components/ui/Select";
import countriesISO from "@/data-list/countriesISO.json";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ServiceForPersonStep2 } from "@/app/servicios/tecnico/persona/StepsGroup";

interface FormData {
  document_type: string;
  document_number: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_prefix: string;
  phone_number: string;
}

interface Props {
  globalStep: number;
  repairsFormData: Partial<ServiceForPersonStep2>;
  setRepairsFormData: (data: Partial<ServiceForPersonStep2>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
  current?: number;
  hideControls?: boolean;
}

export const ContactPersonInfoStep2 = ({
  globalStep,
  repairsFormData,
  setRepairsFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const regexPhoneByCountries = (phone_prefix: string) => {
    const country = countriesISO.find(
      (country) => country.phonePrefix === phone_prefix,
    );
    const regex = country?.regex || "^\\d{4,}$";
    return new RegExp(regex);
  };

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
    first_name: yup.string().required("Nombres requeridos"),
    last_name: yup.string().required("Apellidos requeridos"),
    email: yup.string().email("Email inválido").required("Email requerido"),
    phone_prefix: yup.string().required("Prefijo requerido"),
    phone_number: yup
      .string()
      .required("Teléfono requerido")
      .test("is-valid-phone", "Número de teléfono inválido", function (value) {
        const { phone_prefix } = this.parent;
        return regexPhoneByCountries(phone_prefix).test(value);
      }),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      document_type: repairsFormData?.document?.type || undefined,
      document_number: repairsFormData?.document?.number || "",
      first_name: repairsFormData?.contact?.first_name || "",
      last_name: repairsFormData?.contact?.last_name || "",
      email: repairsFormData?.contact?.email || "",
      phone_prefix: repairsFormData?.contact?.phone?.prefix || "+51",
      phone_number: repairsFormData?.contact?.phone?.number || "",
    },
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = (formData: FormData) => {
    setRepairsFormData({ ...repairsFormData, ...formData });
    addLocalStorageData(formData);
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
                        { label: "DNI", value: "DNI" },
                        { label: "RUC", value: "RUC" },
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
                      placeholder="71XXXXX"
                    />
                  )}
                />
              </div>
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
              <div className="sm:col-span-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Email"
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

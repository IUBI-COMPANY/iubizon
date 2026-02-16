import React from "react";
import * as yup from "yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFormUtils } from "@/hooks/useFormUtils";
import countriesISO from "@/data-list/countriesISO.json";
import documentsTypes from "@/data-list/documentsTypes.json";

interface FormData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  company: string;
}

interface Props {
  globalStep: number;
  leadFormData: Partial<Lead>;
  setLeadFormData: (data: Partial<Lead>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const ContactInfoStep1 = ({
  globalStep,
  leadFormData,
  setLeadFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
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
    fullName: yup.string().required("El nombre es requerido"),
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

  const getInitialValues = () => {
    const storedData = localStorage.getItem("demo_formData");
    const parsedData = storedData ? JSON.parse(storedData) : {};

    return {
      documentType:
        leadFormData?.document?.type || parsedData?.documentType || "",
      documentNumber:
        leadFormData?.document?.number || parsedData?.documentNumber || "",
      fullName: leadFormData?.contact?.fullName || parsedData?.fullName || "",
      email: leadFormData?.contact?.email || parsedData?.email || "",
      phonePrefix:
        leadFormData?.contact?.phone?.prefix ||
        parsedData?.phonePrefix ||
        "+51",
      phoneNumber:
        leadFormData?.contact?.phone?.number || parsedData?.phoneNumber || "",
      company: leadFormData?.contact?.socialReason || parsedData?.company || "",
    };
  };

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: getInitialValues(),
  });

  const documentType = watch("documentType");
  const isRuc = documentType === "RUC";
  const isDni = documentType === "DNI";

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = (formData: FormData) => {
    // Separar nombre en firstName y lastName
    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const isRuc = formData.documentType === "RUC";

    const contactData: Partial<Lead> = {
      contact: {
        firstName,
        lastName,
        fullName: formData.fullName,
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
      clientType: isRuc ? "organization" : "individual",
    };

    setLeadFormData({ ...leadFormData, ...contactData });
    addLocalStorageData(contactData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-white font-semibold mb-6">
        Información de Contacto
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            name="fullName"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Input
                label="Nombre completo"
                placeholder="Juan Pérez"
                name={name}
                value={value}
                error={error(name)}
                helperText={errorMessage(name)}
                required={required(name)}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="juan@empresa.com"
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
                      <option key={country.alpha2} value={country.phonePrefix}>
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
          <div>
            <Controller
              name="company"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <Input
                  label="Razón Social / Empresa"
                  placeholder="Mi Empresa S.A.C."
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

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/30"
        >
          Continuar
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

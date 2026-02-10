import React from "react";
import * as yup from "yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import { Form } from "@/components/ui/Form";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { TimePicker } from "@/components/ui/TimePicker";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import { peruUbigeo } from "@/data-list/ubigeos";
import { Checkbox } from "@/components/ui/Checkbox";
import { sendLead } from "./actions";
import { ArrowLeft, SendIcon } from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { useNotification } from "@/components/ui/Notification";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";
import attendanceTypes from "@/data-list/attendaceTypes.json";

interface FormData {
  attendanceType: string;
  visitDate?: string;
  visitTime?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
  termsAndConditions: boolean;
}

interface Props {
  globalStep: number;
  repairsFormData: Partial<Lead>;
  setRepairsFormData: (data: Partial<Lead>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ServiceTypeStep3 = ({
  globalStep,
  repairsFormData,
  setRepairsFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
  loading,
  setLoading,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    attendanceType: yup.string().required("Debes seleccionar una opción"),
    visitDate: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) =>
        schema
          .required("La fecha de visita es requerida")
          .test(
            "is-valid-date",
            "La fecha no puede ser anterior al día actual",
            (value) => {
              if (!value) return false;
              return isValidVisitDate(value);
            },
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    visitTime: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) =>
        schema
          .required("La hora de visita es requerida")
          .test(
            "is-valid-time",
            "El horario de atención es de 08:00 AM a 05:00 PM",
            (value) => {
              if (!value) return false;
              const [hours] = value.split(":").map(Number);
              return hours >= 8 && hours < 17;
            },
          )
          .test(
            "is-not-past-time",
            "La hora seleccionada ya pasó. Elige una hora futura",
            function (value) {
              if (!value) return false;
              const visitDate = this.parent.visitDate;
              return isValidVisitTime(value, visitDate);
            },
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    district: yup.string().when("attendanceType", {
      is: (value: string) =>
        value === "at_customer" || value === "send_to_store",
      then: (schema) => schema.required("El distrito es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().when("attendanceType", {
      is: (value: string) =>
        value === "at_customer" || value === "send_to_store",
      then: (schema) => schema.required("La dirección es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    department: yup.string().when("attendanceType", {
      is: "send_to_store",
      then: (schema) => schema.required("El departamento es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    province: yup.string().when("attendanceType", {
      is: "send_to_store",
      then: (schema) => schema.required("La provincia es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    termsAndConditions: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
  });

  const getInitialValues = () => {
    const storedData = localStorage.getItem("retail_formData");
    const parsedData = storedData ? JSON.parse(storedData) : {};

    return {
      attendanceType: (parsedData.attendanceType as string) || "on_site",
      visitDate:
        repairsFormData?.serviceDetails?.visitSchedule?.preferredDate || "",
      visitTime:
        repairsFormData?.serviceDetails?.visitSchedule?.preferredTime || "",
      department: repairsFormData?.address?.state || "",
      province: repairsFormData?.address?.city || "",
      district: repairsFormData?.address?.area || "",
      address: repairsFormData?.address?.street || "",
      termsAndConditions: repairsFormData?.termsAndConditions || false,
    };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: getInitialValues(),
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const isLocalVisit = watch("attendanceType") === "on_site";
  const isHouseVisit = watch("attendanceType") === "at_customer";
  const isShipping = watch("attendanceType") === "send_to_store";

  const departmentSelected = watch("department");
  const _departmentSelected = peruUbigeo.find(
    (dep) => dep.name === departmentSelected,
  );
  const provinceSelected = watch("province");
  const _provinceSelected = _departmentSelected?.provinces.find(
    (prov) => prov.name === provinceSelected,
  );

  const districtsByLimaProvince = peruUbigeo[13].provinces[0].districts;

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    // Transformar FormData a Lead structure
    const completeFormData: Partial<Lead> = {
      serviceDetails: {
        ...repairsFormData.serviceDetails,
        visitSchedule:
          formData.attendanceType === "at_customer" &&
          formData.visitDate &&
          formData.visitTime
            ? {
                preferredDate: formData.visitDate,
                preferredTime: formData.visitTime,
              }
            : undefined,
        attendanceType: formData.attendanceType as AttendanceType,
      },
      address:
        (formData.attendanceType === "at_customer" ||
          formData.attendanceType === "send_to_store") &&
        formData.address
          ? {
              street: formData.address,
              state: formData.department,
              city: formData.province,
              area: formData.district,
            }
          : undefined,
      termsAndConditions: formData.termsAndConditions,
    };

    setRepairsFormData({ ...repairsFormData, ...completeFormData });
    addLocalStorageData({
      ...completeFormData,
      attendanceType: formData.attendanceType,
    });

    // Obtener todos los datos del localStorage
    let fullData: Record<string, unknown>;
    try {
      const storedData = localStorage.getItem("retail_formData");
      fullData = storedData ? JSON.parse(storedData) : {};
      fullData = {
        ...fullData,
        ...completeFormData,
        attendanceType: formData.attendanceType,
      };
    } catch (error) {
      console.error("Error parsing stored data: ", error);
      fullData = {
        ...repairsFormData,
        ...completeFormData,
        attendanceType: formData.attendanceType,
      };
    }

    // Construir Lead completo
    const leadData: Partial<Lead> = {
      // Core Fields
      leadType: "service",
      clientType: "individual",
      status: "new",
      archived: false,

      // Contact Information
      contact: fullData.contact as ContactInfo,
      document: fullData.document as DocumentInfo | undefined,

      // Address (at Lead level)
      address: completeFormData.address,

      // Service Details
      serviceDetails: {
        products: (fullData?.products || []) as ProductItem[],
        additionalInformation: fullData.additionalInformation as
          | string
          | undefined,
        serviceType: fullData.serviceType as ServiceType | undefined,
        visitSchedule: completeFormData.serviceDetails?.visitSchedule,
        attendanceType: formData.attendanceType as AttendanceType,
      },

      // Communication
      termsAndConditions: completeFormData.termsAndConditions,
      hostname: "iubizon.com",

      // Tracking
      tracking: {
        source: "website",
        landingPage: window.location.href,
      },
    };

    try {
      await sendLead(leadData as Lead);
      setLoading(false);
      setTimeout(() => {
        setCurrentStepToLocalStorage(globalStep + 1);
      }, 150);
    } catch (error) {
      console.error("Error sending repair email: ", error);
      setLoading(false);

      showNotification(
        "error",
        "Hubo un error al enviar la solicitud. Por favor, inténtelo nuevamente o contacte con soporte.",
        "Error al enviar",
      );
    }
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Tipo de servicio
      </div>
      <div className="mt-5">
        <Form
          onSubmit={
            handleSubmit(onSubmit) as unknown as (
              e: React.FormEvent<HTMLFormElement>,
            ) => Promise<void>
          }
        >
          <div className="grid gap-6 mx-auto max-w-xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Controller
                  name="attendanceType"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <RadioGroup
                      label="¿Qué tipo de servicio deseas?"
                      name={name}
                      value={value as string}
                      error={error(name)}
                      helperText={errorMessage(name)}
                      required={required(name)}
                      onChange={onChange}
                      options={attendanceTypes}
                    />
                  )}
                />

                {isLocalVisit && <BusinessAddress />}
                {isHouseVisit && (
                  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 my-6">
                    <div className="sm:col-span-1">
                      <Controller
                        name="visitDate"
                        control={control}
                        render={({ field: { onChange, value, name } }) => (
                          <DatePicker
                            label="Dinos qué día podemos visitarte"
                            name={name}
                            value={value as string}
                            error={error(name)}
                            helperText={errorMessage(name)}
                            required={required(name)}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Controller
                        name="visitTime"
                        control={control}
                        render={({ field: { onChange, value, name } }) => (
                          <TimePicker
                            label="Dinos a qué hora podemos visitarte"
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
                )}
                {isShipping && (
                  <>
                    <BusinessAddress />
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 my-6">
                      <Alert
                        type="info"
                        message="Necesitamos tu dirección para poder reenviarte tu equipo una vez hagamos culminado con el servicio."
                      />
                      <div className="sm:col-span-1">
                        <Controller
                          name="department"
                          control={control}
                          render={({ field: { onChange, value, name } }) => (
                            <Select
                              label="Departamento"
                              placeholder="Ej. Lima"
                              name={name}
                              value={value}
                              error={error(name)}
                              helperText={errorMessage(name)}
                              required={required(name)}
                              onChange={onChange}
                              options={peruUbigeo.map((dep) => ({
                                value: dep.name,
                                label: dep.name,
                              }))}
                            />
                          )}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Controller
                          name="province"
                          control={control}
                          render={({ field: { onChange, value, name } }) => (
                            <Select
                              label="Provincia"
                              placeholder="Ej. Lima"
                              name={name}
                              value={value}
                              error={error(name)}
                              helperText={errorMessage(name)}
                              required={required(name)}
                              onChange={onChange}
                              options={
                                _departmentSelected?.provinces.map((prov) => ({
                                  value: prov.name,
                                  label: prov.name,
                                })) || []
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
                {(isHouseVisit || isShipping) && (
                  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6 my-6">
                    <div className="sm:col-span-2">
                      <Controller
                        name="district"
                        control={control}
                        render={({ field: { onChange, value, name } }) => (
                          <Select
                            label="Distrito"
                            placeholder="Ej. Chorrillos"
                            name={name}
                            value={value}
                            error={error(name)}
                            helperText={errorMessage(name)}
                            required={required(name)}
                            onChange={onChange}
                            options={
                              _provinceSelected?.districts.map((dist) => ({
                                value: dist.name,
                                label: dist.name,
                              })) ||
                              districtsByLimaProvince.map((dist) => ({
                                value: dist.name,
                                label: dist.name,
                              }))
                            }
                          />
                        )}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Controller
                        name="address"
                        control={control}
                        render={({ field: { onChange, value, name } }) => (
                          <Input
                            label="Dirección"
                            placeholder="Av. Huaylas 123"
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
                )}
                <div className="sm:col-span-2">
                  <Controller
                    name="termsAndConditions"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Checkbox
                        name={name}
                        value={value}
                        error={error(name)}
                        helperText={errorMessage(name)}
                        required={required(name)}
                        onChange={onChange}
                      >
                        <div>
                          Acepto los{" "}
                          <a
                            href="#"
                            className="hover:text-slate-800 font-semibold underline"
                          >
                            términos y condiciones
                          </a>
                        </div>
                      </Checkbox>
                    )}
                  />
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    block
                    variant="secondary"
                    type="button"
                    disabled={loading}
                    onClick={() => setCurrentStepToLocalStorage(globalStep - 1)}
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <ArrowLeft /> <span>Atrás</span>
                    </div>
                  </Button>
                  <Button
                    block
                    variant="primary"
                    type="submit"
                    loading={loading}
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <SendIcon /> <span>Enviar solicitud</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
      {NotificationComponent}
    </div>
  );
};

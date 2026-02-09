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
import { ServiceForOrgStep3 } from "@/app/servicios/tecnico/organizacion/StepsGroup";
import { useNotification } from "@/components/ui/Notification";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";
import { attendanceTypes } from "@/data-list/attendaceTypes";

interface FormData {
  attendance_type: AttendanceType;
  visit_date?: string;
  visit_time?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
  terms_and_conditions: boolean;
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
    attendance_type: yup.string().required("Debes seleccionar una opción"),
    visit_date: yup.string().when("attendance_type", {
      is: "home_visit",
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
    visit_time: yup.string().when("attendance_type", {
      is: "home_visit",
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
              const visitDate = this.parent.visit_date;
              return isValidVisitTime(value, visitDate);
            },
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    district: yup.string().when("attendance_type", {
      is: (value: string) =>
        value === "home_visit" || value === "send_to_store",
      then: (schema) => schema.required("El distrito es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().when("attendance_type", {
      is: (value: string) =>
        value === "home_visit" || value === "send_to_store",
      then: (schema) => schema.required("La dirección es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    department: yup.string().when("attendance_type", {
      is: "send_to_store",
      then: (schema) => schema.required("El departamento es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    province: yup.string().when("attendance_type", {
      is: "send_to_store",
      then: (schema) => schema.required("La provincia es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    terms_and_conditions: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
  });

  const getInitialValues = () => {
    const storedData = localStorage.getItem("organization_formData");
    const parsedData = storedData ? JSON.parse(storedData) : {};

    return {
      attendance_type:
        (parsedData?.attendanceType as AttendanceType) || "on_site",
      visit_date:
        repairsFormData?.serviceDetails?.visitSchedule?.preferredDate || "",
      visit_time:
        repairsFormData?.serviceDetails?.visitSchedule?.preferredTime || "",
      department: repairsFormData?.address?.state || "",
      province: repairsFormData?.address?.city || "",
      district: repairsFormData?.address?.area || "",
      address: repairsFormData?.address?.street || "",
      terms_and_conditions: repairsFormData?.termsAndConditions || false,
    };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: getInitialValues(),
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const isLocalVisit = watch("attendance_type") === "on_site";
  const isHouseVisit = watch("attendance_type") === "at_customer";
  const isShipping = watch("attendance_type") === "shipping";

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

    // Transformar FormData para actualizar Lead
    const completeFormData: Partial<Lead> = {
      serviceDetails: {
        ...repairsFormData.serviceDetails,
        visitSchedule:
          formData.attendance_type === "at_customer" &&
          formData.visit_date &&
          formData.visit_time
            ? {
                preferredDate: formData.visit_date,
                preferredTime: formData.visit_time,
              }
            : undefined,
        attendanceType: formData.attendance_type,
      },
      address:
        (formData.attendance_type === "at_customer" ||
          formData.attendance_type === "shipping") &&
        formData.address
          ? {
              street: formData.address,
              state: formData.department,
              city: formData.province,
              area: formData.district,
            }
          : undefined,
      termsAndConditions: formData.terms_and_conditions,
    };

    setRepairsFormData({ ...repairsFormData, ...completeFormData });
    addLocalStorageData({
      ...completeFormData,
      attendanceType: formData.attendance_type,
    });

    // Obtener todos los datos del localStorage
    let fullData: Record<string, unknown>;
    try {
      const storedData = localStorage.getItem("organization_formData");
      fullData = storedData ? JSON.parse(storedData) : {};
      fullData = {
        ...fullData,
        ...completeFormData,
        attendanceType: formData.attendance_type,
      };
    } catch (error) {
      console.error("Error parsing stored data: ", error);
      fullData = {
        ...repairsFormData,
        ...completeFormData,
        attendanceType: formData.attendance_type,
      };
    }

    // Construir Lead completo
    const leadData: Partial<Lead> = {
      // Core Fields
      leadType: "service",
      clientType: fullData.clientType as ClientType,
      status: "new",
      archived: false,

      // Contact Information
      contact: fullData.contact as ContactInfo,
      document: fullData.document as DocumentInfo | undefined,

      // Organization Info
      organizationInfo: fullData.organizationInfo as Lead["organizationInfo"],

      // Address (at Lead level)
      address: completeFormData.address,

      // Service Details
      serviceDetails: {
        additionalInformation: fullData.additionalInformation as
          | string
          | undefined,
        serviceType: fullData.serviceType as ServiceType | undefined,
        visitSchedule: completeFormData.serviceDetails?.visitSchedule,
        attendanceType: formData.attendance_type as AttendanceType,
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
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full grid gap-6 mx-auto">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Controller
                  name="attendance_type"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <RadioGroup
                      label="¿Qué tipo de servicio deseas?"
                      name={name}
                      value={value}
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
                        name="visit_date"
                        control={control}
                        render={({ field: { onChange, value, name } }) => (
                          <DatePicker
                            label="Dinos qué día podemos visitarte"
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
                    <div className="sm:col-span-1">
                      <Controller
                        name="visit_time"
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
                    <div className="sm: col-span-2">
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
                <div className="sm:col-span-2 my-6">
                  <Controller
                    name="terms_and_conditions"
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

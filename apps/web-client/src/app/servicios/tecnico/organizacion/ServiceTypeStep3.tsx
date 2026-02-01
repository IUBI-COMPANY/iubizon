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
import { sendTechnicalServiceEmail } from "./actions";
import { ArrowLeft, SendIcon } from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { OrganizationRepairStep3 } from "@/app/servicios/tecnico/organizacion/StepsGroup";
import { useNotification } from "@/components/ui/Notification";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";

interface FormData {
  attendance_type: string;
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
  repairsFormData: Partial<OrganizationRepairStep3>;
  setRepairsFormData: (data: Partial<OrganizationRepairStep3>) => void;
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

  // Obtener valores iniciales de la estructura
  const getInitialValues = () => {
    // Para servicio técnico, attendance_type no está en service_details
    // Lo sacamos directamente del repairsFormData si fue guardado antes
    const storedData = localStorage.getItem("organization_formData");
    const parsedData = storedData ? JSON.parse(storedData) : {};

    return {
      attendance_type: (parsedData.attendance_type as string) || "go_to_store",
      visit_date: repairsFormData?.visit_schedule?.preferred_date || "",
      visit_time: repairsFormData?.visit_schedule?.preferred_time || "",
      department: repairsFormData?.address?.department || "",
      province: repairsFormData?.address?.province || "",
      district: repairsFormData?.address?.district || "",
      address: repairsFormData?.address?.street || "",
      terms_and_conditions: repairsFormData?.terms_and_conditions || false,
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

  const isLocalVisit = watch("attendance_type") === "go_to_store";
  const isHouseVisit = watch("attendance_type") === "home_visit";
  const isShipping = watch("attendance_type") === "send_to_store";

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

    // Transformar FormData a OrganizationRepairStep3
    const completeFormData: OrganizationRepairStep3 = {
      service_details: {
        // ServiceDetails no incluye attendance_type, solo service_type
        // que ya viene del Step 1
      },
      visit_schedule:
        formData.attendance_type === "home_visit" &&
        formData.visit_date &&
        formData.visit_time
          ? {
              preferred_date: formData.visit_date,
              preferred_time: formData.visit_time,
            }
          : undefined,
      address:
        (formData.attendance_type === "home_visit" ||
          formData.attendance_type === "send_to_store") &&
        formData.address
          ? {
              street: formData.address,
              department: formData.department,
              province: formData.province,
              district: formData.district,
            }
          : undefined,
      terms_and_conditions: formData.terms_and_conditions,
    };

    setRepairsFormData({ ...repairsFormData, ...completeFormData });
    addLocalStorageData({
      ...completeFormData,
      attendance_type: formData.attendance_type,
    });

    // Obtener todos los datos del localStorage
    let fullData: Record<string, unknown>;
    try {
      const storedData = localStorage.getItem("organization_formData");
      fullData = storedData ? JSON.parse(storedData) : {};
      fullData = {
        ...fullData,
        ...completeFormData,
        attendance_type: formData.attendance_type,
      };
    } catch (error) {
      console.error("Error parsing stored data: ", error);
      fullData = {
        ...repairsFormData,
        ...completeFormData,
        attendance_type: formData.attendance_type,
      };
    }

    // Construir LeadForIubizon completo
    const leadData: Partial<LeadForIubizon> = {
      // Core Fields
      client_id: "gYn8QUB8g35wEAZcZz7D",
      lead_type: "technical_service",
      client_type:
        (fullData.client_type as "individual" | "organization") ||
        "organization",
      status: "new",
      archived: false,

      // Contact Information
      contact: fullData.contact as ContactInfo,
      document: fullData.document as DocumentInfo | undefined,

      // Organization Info
      organization_info:
        fullData.organization_info as LeadForIubizon["organization_info"],

      // Products (equipment) - ya incluye service_type
      products: fullData.products as ProductItem[],
      description_more_details: fullData.description_more_details as
        | string
        | undefined,

      // Service Details - sin attendance_type
      service_details: completeFormData.service_details,
      visit_schedule: completeFormData.visit_schedule,
      address: completeFormData.address,

      // Communication
      terms_and_conditions: completeFormData.terms_and_conditions,
      hostname: window.location.hostname,

      // Tracking
      tracking: {
        source: "website",
        landing_page: window.location.href,
      },
    };

    try {
      console.log("Sending lead data: ", leadData);
      await sendTechnicalServiceEmail(leadData as LeadForIubizon);
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
                      options={[
                        {
                          label: "Quiero ir al local",
                          value: "go_to_store",
                        },
                        {
                          label: "Quiero una visita técnica a mi domicilio",
                          value: "home_visit",
                          message: "Solo para Lima",
                        },
                        {
                          label: "Quiero enviar mi producto al local",
                          value: "send_to_store",
                          message: "Solo para provincias",
                        },
                        {
                          label: "Quiero una cotización",
                          value: "quotation",
                        },
                        {
                          label: "Otro",
                          value: "other",
                        },
                      ]}
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
                    <div className="sm: col-span-4">
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
                <div className="sm: col-span-2">
                  <Controller
                    name="terms_and_conditions"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Checkbox
                        name={name}
                        checked={value}
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

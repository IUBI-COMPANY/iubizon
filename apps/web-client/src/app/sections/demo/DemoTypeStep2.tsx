import React from "react";
import * as yup from "yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChevronRight, Loader2, MapPin, Video, Store } from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { useFormUtils } from "@/hooks/useFormUtils";
import { sendDemoLead } from "./actions";
import { useNotification } from "@/components/ui/Notification";

interface FormData {
  attendanceType: string;
  visitDate?: string;
  visitTime?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
}

interface Props {
  globalStep: number;
  leadFormData: Partial<Lead>;
  setLeadFormData: (data: Partial<Lead>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const DemoTypeStep2 = ({
  globalStep,
  leadFormData,
  setLeadFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
  loading,
  setLoading,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    attendanceType: yup.string().required("Debes seleccionar una modalidad"),
    visitDate: yup.string().when("attendanceType", {
      is: (value: string) => ["at_customer", "remote"].includes(value),
      then: (schema) =>
        schema
          .required("La fecha es requerida")
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
      is: (value: string) => ["at_customer", "remote"].includes(value),
      then: (schema) =>
        schema
          .required("La hora es requerida")
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
    department: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) => schema.required("El departamento es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    province: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) => schema.required("La provincia es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    district: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) => schema.required("El distrito es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().when("attendanceType", {
      is: "at_customer",
      then: (schema) => schema.required("La dirección es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const getInitialValues = () => {
    const storedData = localStorage.getItem("demo_formData");
    const parsedData = storedData ? JSON.parse(storedData) : {};

    return {
      attendanceType:
        (parsedData?.attendanceType as AttendanceType) || "on_site",
      visitDate:
        leadFormData?.serviceDetails?.visitSchedule?.preferredDate || "",
      visitTime:
        leadFormData?.serviceDetails?.visitSchedule?.preferredTime || "",
      department: leadFormData?.serviceDetails?.address?.state || "",
      province: leadFormData?.serviceDetails?.address?.city || "",
      district: leadFormData?.serviceDetails?.address?.area || "",
      address: leadFormData?.serviceDetails?.address?.street || "",
    };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: getInitialValues(),
  });

  const { required, error, errorMessage } = useFormUtils({ errors, schema });

  const attendanceTypeSelected = watch("attendanceType");
  const departmentSelected = watch("department");
  const provinceSelected = watch("province");

  // Obtener departamentos
  const departments = peruUbigeo.map((dept) => ({
    value: dept.name,
    label: dept.name,
  }));

  // Obtener provincias según departamento seleccionado
  const provinces = departmentSelected
    ? peruUbigeo
        .find((dept) => dept.name === departmentSelected)
        ?.provinces.map((prov) => ({
          value: prov.name,
          label: prov.name,
        })) || []
    : [];

  // Obtener distritos según provincia seleccionada
  const districts =
    provinceSelected && departmentSelected
      ? peruUbigeo
          .find((dept) => dept.name === departmentSelected)
          ?.provinces.find((prov) => prov.name === provinceSelected)
          ?.districts.map((dist) => ({
            value: dist.name,
            label: dist.name,
          })) || []
      : [];

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    // Transformar FormData a Lead structure
    const completeFormData: Partial<Lead> = {
      serviceDetails: {
        ...leadFormData.serviceDetails,
        attendanceType: formData.attendanceType as AttendanceType,
        visitSchedule:
          (formData.attendanceType === "at_customer" ||
            formData.attendanceType === "remote") &&
          formData.visitDate &&
          formData.visitTime
            ? {
                preferredDate: formData.visitDate,
                preferredTime: formData.visitTime,
              }
            : undefined,
        address:
          formData.attendanceType === "at_customer" && formData.address
            ? {
                state: formData.department,
                city: formData.province,
                area: formData.district,
                street: formData.address,
              }
            : undefined,
      },
    };

    setLeadFormData({ ...leadFormData, ...completeFormData });
    addLocalStorageData(completeFormData);

    // Obtener todos los datos del localStorage
    let fullData: Record<string, unknown>;
    try {
      const storedData = localStorage.getItem("demo_formData");
      fullData = storedData ? JSON.parse(storedData) : {};
      fullData = { ...fullData, ...completeFormData };
    } catch (error) {
      console.error("Error parsing stored data: ", error);
      fullData = {
        ...leadFormData,
        ...completeFormData,
      };
    }

    // Construir Lead completo
    const leadData: Lead = {
      // Core Fields
      leadType: "service",
      clientType: "individual",
      status: "new",
      archived: false,
      // Contact Information
      contact: fullData.contact as ContactInfo,
      // Service Details
      serviceDetails: fullData.serviceDetails as Lead["serviceDetails"],
      // Communication
      termsAndConditions: true,
      isQuoteRequest: false,
      hostname: "iubizon.com",
      // Tracking
      tracking: {
        source: "website",
        landingPage: window.location.href,
      },
    };

    console.log("📦 Lead Data to send:", leadData);

    try {
      await sendDemoLead(leadData);
      setLoading(false);
      setTimeout(() => {
        setCurrentStepToLocalStorage(globalStep + 1);
      }, 150);
    } catch (error) {
      console.error("Error sending demo lead: ", error);
      setLoading(false);

      showNotification(
        "error",
        "Hubo un error al enviar la solicitud. Por favor, inténtelo nuevamente o contacte con soporte.",
        "Error al enviar",
      );
    }
  };

  const attendanceTypes = [
    {
      value: "at_customer",
      label: "Visita a domicilio",
      description: "Agendamos una demo presencial en tu oficina o institución",
      icon: MapPin,
    },
    {
      value: "remote",
      label: "Demo Virtual",
      description: "Demostración del funcionamiento mediante videollamada",
      icon: Video,
    },
    {
      value: "on_site",
      label: "Visita a nuestro local",
      description: "Ven a nuestras instalaciones y conoce el producto en vivo",
      icon: Store,
    },
  ];

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-white font-semibold mb-6">
        Tipo de Demostración
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="attendanceType"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <RadioGroup
              label="¿Cómo te gustaría recibir tu demo?"
              name={name}
              value={value as string}
              error={error(name)}
              helperText={errorMessage(name)}
              required={required(name)}
              onChange={onChange}
              options={attendanceTypes}
              theme="dark"
            />
          )}
        />

        {/* Mostrar BusinessAddress cuando es recojo en local */}
        {attendanceTypeSelected === "on_site" && (
          <div className="mt-6">
            <BusinessAddress />
          </div>
        )}

        {/* Campos para visita a domicilio */}
        {attendanceTypeSelected === "at_customer" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Controller
                name="visitDate"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <DatePicker
                    label="Fecha preferida"
                    name={name}
                    value={value as string}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                name="visitTime"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <TimePicker
                    label="Hora preferida"
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
            <div className="grid md:grid-cols-3 gap-6">
              <Controller
                name="department"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Select
                    label="Departamento"
                    placeholder="Seleccionar"
                    name={name}
                    value={value}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={(newValue) => {
                      onChange(newValue);
                      // Limpiar provincia y distrito cuando cambia departamento
                      setValue("province", "");
                      setValue("district", "");
                    }}
                    options={departments}
                    textColor="white"
                  />
                )}
              />
              <Controller
                name="province"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Select
                    label="Provincia"
                    placeholder="Seleccionar"
                    name={name}
                    value={value}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={(newValue) => {
                      onChange(newValue);
                      // Limpiar distrito cuando cambia provincia
                      setValue("district", "");
                    }}
                    options={provinces}
                    textColor="white"
                  />
                )}
              />
              <Controller
                name="district"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Select
                    label="Distrito"
                    placeholder="Seleccionar"
                    name={name}
                    value={value}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={onChange}
                    options={districts}
                    textColor="white"
                  />
                )}
              />
            </div>
            <Controller
              name="address"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <Input
                  label="Dirección"
                  placeholder="Av. Principal 123"
                  name={name}
                  value={value}
                  error={error(name)}
                  helperText={errorMessage(name)}
                  required={required(name)}
                  onChange={onChange}
                  textColor="white"
                />
              )}
            />
          </div>
        )}

        {/* Campos para Demo Virtual */}
        {attendanceTypeSelected === "remote" && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <Video className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-blue-300 text-sm">
                La reunión será realizada mediante{" "}
                <span className="font-semibold">Google Meet</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Controller
                name="visitDate"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <DatePicker
                    label="Fecha preferida"
                    name={name}
                    value={value as string}
                    error={error(name)}
                    helperText={errorMessage(name)}
                    required={required(name)}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                name="visitTime"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <TimePicker
                    label="Hora preferida"
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

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStepToLocalStorage(globalStep - 1)}
            disabled={loading}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Atrás
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar solicitud
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
      {NotificationComponent}
    </div>
  );
};

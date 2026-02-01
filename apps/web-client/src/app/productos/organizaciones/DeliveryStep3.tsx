import React from "react";
import * as yup from "yup";
import { Controller, Resolver, useForm } from "react-hook-form";
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
import { sendProductRequestEmail } from "./actions";
import { ArrowLeft, SendIcon } from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { SaleForOrganizationStep3 } from "@/app/productos/organizaciones/StepsGroup";
import { useNotification } from "@/components/ui/Notification";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";

interface FormData {
  delivery_option?: DeliveryType;
  is_quotation?: boolean;
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
  productFormData: Partial<SaleForOrganizationStep3>;
  setProductFormData: (data: Partial<SaleForOrganizationStep3>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const DeliveryStep3 = ({
  globalStep,
  productFormData,
  setProductFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
  loading,
  setLoading,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    delivery_option: yup.string().required("Debes seleccionar una opción"),
    is_quotation: yup.boolean().notRequired(),
    visit_date: yup.string().when("delivery_option", {
      is: "home_delivery",
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
    visit_time: yup.string().when("delivery_option", {
      is: "home_delivery",
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
    district: yup.string().when("delivery_option", {
      is: (value: string) =>
        value === "home_delivery" || value === "province_shipping",
      then: (schema) => schema.required("El distrito es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().when("delivery_option", {
      is: (value: string) =>
        value === "home_delivery" || value === "province_shipping",
      then: (schema) => schema.required("La dirección es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    department: yup.string().when("delivery_option", {
      is: "province_shipping",
      then: (schema) => schema.required("El departamento es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    province: yup.string().when("delivery_option", {
      is: "province_shipping",
      then: (schema) => schema.required("La provincia es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    terms_and_conditions: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
  });

  const getInitialValues = () => {
    const delivery = productFormData?.delivery;

    return {
      delivery_option: productFormData?.delivery?.type || "store_pickup",
      visit_date: delivery?.home_delivery?.preferred_date || "",
      visit_time: delivery?.home_delivery?.preferred_time || "",
      department: delivery?.province_shipping?.address.department || "",
      province: delivery?.province_shipping?.address.province || "",
      district:
        delivery?.home_delivery?.address.district ||
        delivery?.province_shipping?.address.district ||
        "",
      address:
        delivery?.home_delivery?.address.street ||
        delivery?.province_shipping?.address.street ||
        "",
      terms_and_conditions: productFormData?.terms_and_conditions || false,
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

  const deliveryOption = watch("delivery_option");
  const isPickup = deliveryOption === "store_pickup";
  const isDelivery = deliveryOption === "home_delivery";
  const isShipping = deliveryOption === "province_shipping";
  const isQuoteOnly = watch("is_quotation");

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

    // 1. Transformar datos del formulario a la nueva estructura
    const completeFormData: SaleForOrganizationStep3 = {
      ...(formData.is_quotation && { attendance_type: "quotation" }),
      terms_and_conditions: formData.terms_and_conditions,
    };

    // Si NO es solo cotización, construir el objeto delivery
    if (!formData.is_quotation) {
      switch (formData.delivery_option) {
        case "store_pickup":
          completeFormData.delivery = {
            type: "store_pickup",
          };
          break;

        case "home_delivery":
          if (
            !formData.visit_date ||
            !formData.visit_time ||
            !formData.district ||
            !formData.address
          ) {
            showNotification(
              "error",
              "Por favor completa todos los campos requeridos para entrega a domicilio",
              "Campos incompletos",
            );
            setLoading(false);
            return;
          }
          completeFormData.delivery = {
            type: "home_delivery",
            home_delivery: {
              preferred_date: formData.visit_date,
              preferred_time: formData.visit_time,
              address: {
                district: formData.district,
                street: formData.address,
              },
            },
          };
          break;

        case "province_shipping":
          if (
            !formData.department ||
            !formData.province ||
            !formData.district ||
            !formData.address
          ) {
            showNotification(
              "error",
              "Por favor completa todos los campos requeridos para envío a provincias",
              "Campos incompletos",
            );
            setLoading(false);
            return;
          }
          completeFormData.delivery = {
            type: "province_shipping",
            province_shipping: {
              address: {
                department: formData.department,
                province: formData.province,
                district: formData.district,
                street: formData.address,
              },
              estimated_delivery_days: 5,
            },
          };
          break;
      }
    }

    setProductFormData({ ...productFormData, ...completeFormData });
    addLocalStorageData(completeFormData);

    // 2. Obtener todos los datos del localStorage
    let fullData: Record<string, unknown>;
    try {
      const storedData = localStorage.getItem("org_products_formData");
      fullData = storedData ? JSON.parse(storedData) : {};
      fullData = { ...fullData, ...completeFormData };
    } catch (error) {
      console.error(
        "Error parsing stored organization products form data: ",
        error,
      );
      fullData = {
        ...productFormData,
        ...completeFormData,
      };
    }

    // 3. Validar que existan los datos esenciales
    if (!fullData.contact || !fullData.products) {
      console.error("Missing required data:", fullData);
      showNotification(
        "error",
        "Faltan datos requeridos. Por favor, complete todos los pasos del formulario.",
        "Error de datos",
      );
      setLoading(false);
      return;
    }

    // 4. Construir LeadForIubizon completo
    const leadData: Partial<LeadForIubizon> = {
      // Core Fields
      client_id: "gYn8QUB8g35wEAZcZz7D",
      lead_type: "sale",
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

      // Products
      products: fullData.products as ProductItem[],
      description_more_details: fullData.description_more_details as
        | string
        | undefined,

      // Delivery (nueva estructura)
      delivery: completeFormData.delivery,
      // Attendance Type (OPTIONAL)
      ...(completeFormData?.attendance_type && {
        attendance_type: completeFormData?.attendance_type,
      }),

      // Communication
      terms_and_conditions: completeFormData.terms_and_conditions,
      hostname: window.location.hostname,

      // Tracking
      tracking: {
        source: "website",
        landing_page: window.location.href,
      },
    };

    // 5. Enviar al servidor
    try {
      console.log("Sending lead data: ", leadData);
      await sendProductRequestEmail(leadData as LeadForIubizon);
      console.log("Sending lead data: ", leadData);
      setLoading(false);
      setTimeout(() => {
        setCurrentStepToLocalStorage(globalStep + 1);
      }, 150);
    } catch (error) {
      console.error("Error sending product request email: ", error);
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
        Tipo de entrega
      </div>
      <div className="mt-5">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 mx-auto max-w-xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Controller
                  name="is_quotation"
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
                      Quiero una cotización por el momento
                    </Checkbox>
                  )}
                />
                {isQuoteOnly && (
                  <Alert
                    type="success"
                    message="✓ Te contactaremos en menos de 24 horas con tu cotización personalizada"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                {!isQuoteOnly && (
                  <>
                    <Controller
                      name="delivery_option"
                      control={control}
                      render={({ field: { onChange, value, name } }) => (
                        <RadioGroup
                          label="¿Cómo deseas recibir los productos?"
                          name={name}
                          value={value}
                          error={error(name)}
                          helperText={errorMessage(name)}
                          required={required(name)}
                          onChange={onChange}
                          hidden={isQuoteOnly}
                          options={[
                            {
                              label: "Recojo en tienda",
                              value: "store_pickup",
                            },
                            {
                              label: "Entrega a domicilio",
                              value: "home_delivery",
                              message: "Para Lima Metropolitana",
                            },
                            {
                              label: "Envío a provincias",
                              value: "province_shipping",
                              message: "Envío por courier",
                            },
                          ]}
                        />
                      )}
                    />

                    {isPickup && <BusinessAddress />}

                    {isDelivery && (
                      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 my-6">
                        <div className="sm:col-span-1">
                          <Controller
                            name="visit_date"
                            control={control}
                            render={({ field: { onChange, value, name } }) => (
                              <DatePicker
                                label="Fecha preferida de entrega"
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
                                label="Horario preferido"
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
                            name="district"
                            control={control}
                            render={({ field: { onChange, value, name } }) => (
                              <Select
                                label="Distrito"
                                placeholder="Ej. Miraflores"
                                name={name}
                                value={value}
                                error={error(name)}
                                helperText={errorMessage(name)}
                                required={required(name)}
                                onChange={onChange}
                                options={districtsByLimaProvince.map(
                                  (dist) => ({
                                    value: dist.name,
                                    label: dist.name,
                                  }),
                                )}
                              />
                            )}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Controller
                            name="address"
                            control={control}
                            render={({ field: { onChange, value, name } }) => (
                              <Input
                                label="Dirección completa"
                                placeholder="Av. Larco 1234, Of. 501"
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
                        <div className="my-6">
                          <Alert
                            type="info"
                            message="Necesitamos tu dirección completa para coordinar el envío de los productos."
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 my-6">
                          <div className="sm:col-span-1">
                            <Controller
                              name="department"
                              control={control}
                              render={({
                                field: { onChange, value, name },
                              }) => (
                                <Select
                                  label="Departamento"
                                  placeholder="Ej. Arequipa"
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
                              render={({
                                field: { onChange, value, name },
                              }) => (
                                <Select
                                  label="Provincia"
                                  placeholder="Ej. Arequipa"
                                  name={name}
                                  value={value}
                                  error={error(name)}
                                  helperText={errorMessage(name)}
                                  required={required(name)}
                                  onChange={onChange}
                                  options={
                                    _departmentSelected?.provinces.map(
                                      (prov) => ({
                                        value: prov.name,
                                        label: prov.name,
                                      }),
                                    ) || []
                                  }
                                />
                              )}
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <Controller
                              name="district"
                              control={control}
                              render={({
                                field: { onChange, value, name },
                              }) => (
                                <Select
                                  label="Distrito"
                                  placeholder="Ej. Cayma"
                                  name={name}
                                  value={value}
                                  error={error(name)}
                                  helperText={errorMessage(name)}
                                  required={required(name)}
                                  onChange={onChange}
                                  options={
                                    _provinceSelected?.districts.map(
                                      (dist) => ({
                                        value: dist.name,
                                        label: dist.name,
                                      }),
                                    ) || []
                                  }
                                />
                              )}
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <Controller
                              name="address"
                              control={control}
                              render={({
                                field: { onChange, value, name },
                              }) => (
                                <Input
                                  label="Dirección completa"
                                  placeholder="Av. Ejercito 456"
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
                      </>
                    )}
                  </>
                )}
                <div className="sm:col-span-2 mt-4">
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

                <div className="mt-6 flex flex-row justify-between gap-3">
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={loading}
                    size="md"
                    block
                    onClick={() => setCurrentStepToLocalStorage(globalStep - 1)}
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Atrás</span>
                    </div>
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    loading={loading}
                    size="md"
                    block
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <SendIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Enviar solicitud</span>
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

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
import { ArrowLeft, SendIcon } from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { useNotification } from "@/components/ui/Notification";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";
import deliveryTypes from "@/data-list/deliveryTypes.json";
import { sendLead } from "@/app/productos/pedido/actions";

interface FormData {
  deliveryOption?: DeliveryType;
  isQuotation?: boolean;
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
  leadFormData: Partial<Lead>;
  setLeadFormData: (data: Partial<Lead>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const DeliveryStep3 = ({
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
    deliveryOption: yup.string().required("Debes seleccionar una opción"),
    isQuotation: yup.boolean().notRequired(),
    visitDate: yup.string().when("deliveryOption", {
      is: "local_delivery",
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
    visitTime: yup.string().when("deliveryOption", {
      is: "local_delivery",
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
    district: yup
      .string()
      .when(
        ["deliveryOption", "isQuotation"],
        ([deliveryOption, isQuotation], schema) => {
          if (
            !isQuotation &&
            ["local_delivery", "regional_delivery"].includes(deliveryOption)
          ) {
            return schema.required("La dirección es requerida");
          }

          return schema.notRequired();
        },
      ),
    address: yup
      .string()
      .when(
        ["deliveryOption", "isQuotation"],
        ([deliveryOption, isQuotation], schema) => {
          if (
            !isQuotation &&
            ["local_delivery", "regional_delivery"].includes(deliveryOption)
          ) {
            return schema.required("La dirección es requerida");
          }

          return schema.notRequired();
        },
      ),
    department: yup
      .string()
      .when(
        ["deliveryOption", "isQuotation"],
        ([deliveryOption, isQuotation], schema) => {
          if (!isQuotation && ["regional_delivery"].includes(deliveryOption)) {
            return schema.required("La dirección es requerida");
          }

          return schema.notRequired();
        },
      ),
    province: yup
      .string()
      .when(
        ["deliveryOption", "isQuotation"],
        ([deliveryOption, isQuotation], schema) => {
          if (!isQuotation && ["regional_delivery"].includes(deliveryOption)) {
            return schema.required("La dirección es requerida");
          }

          return schema.notRequired();
        },
      ),
    termsAndConditions: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
  });

  const getInitialValues = (): FormData => {
    const delivery = leadFormData?.productSaleDetails?.delivery;

    return {
      deliveryOption: (delivery?.type as DeliveryType) || "pickup",
      visitDate: delivery?.localDelivery?.preferredDate || "",
      visitTime: delivery?.localDelivery?.preferredTime || "",
      department: delivery?.regionalDelivery?.address?.state || "",
      province: delivery?.regionalDelivery?.address?.city || "",
      district:
        delivery?.localDelivery?.address?.area ||
        delivery?.regionalDelivery?.address?.area ||
        "",
      address:
        delivery?.localDelivery?.address?.street ||
        delivery?.regionalDelivery?.address?.street ||
        "",
      termsAndConditions: leadFormData?.termsAndConditions || false,
      isQuotation: leadFormData?.isQuoteRequest || false,
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

  const deliveryOption = watch("deliveryOption");
  const isPickup = deliveryOption === "pickup";
  const isDelivery = deliveryOption === "local_delivery";
  const isShipping = deliveryOption === "regional_delivery";
  const isQuoteOnly = watch("isQuotation");

  const departmentSelected = watch("department");
  const _departmentSelected = peruUbigeo.find(
    (dep) => dep.name === departmentSelected,
  );
  const provinceSelected = watch("province");
  const _provinceSelected = _departmentSelected?.provinces.find(
    (prov) => prov.name === provinceSelected,
  );

  const districtsByLimaProvince = peruUbigeo[13].provinces[0].districts;

  const deliveryFields = (
    formData: FormData,
  ): ProductSaleDetails["delivery"] => {
    // Si NO es solo cotización, construir el objeto delivery
    if (!formData.isQuotation) {
      switch (formData.deliveryOption) {
        case "pickup":
          return {
            type: "pickup",
          };

        case "local_delivery":
          return {
            type: "local_delivery",
            localDelivery: {
              preferredDate: formData.visitDate,
              preferredTime: formData.visitTime,
              address: {
                area: formData?.district || "",
                street: formData?.address || "",
              },
            },
          };

        case "regional_delivery":
          return {
            type: "regional_delivery",
            regionalDelivery: {
              address: {
                state: formData?.department || "",
                city: formData?.province || "",
                area: formData?.district || "",
                street: formData?.address || "",
              },
              estimatedDeliveryDays: 5,
            },
          };

        default:
          return undefined;
      }
    }
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    // 1. Transformar datos del formulario a la nueva estructura
    const completeFormData: Partial<Lead> = {
      isQuoteRequest: formData.isQuotation,
      productSaleDetails: {
        ...leadFormData.productSaleDetails,
        products: leadFormData?.productSaleDetails?.products || [],
        delivery: deliveryFields(formData) || undefined,
      },
      termsAndConditions: formData.termsAndConditions,
    };

    setLeadFormData({ ...leadFormData, ...completeFormData });
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
        ...leadFormData,
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

    const leadData: Lead = {
      // Core Fields
      leadType: "sale",
      clientType:
        (fullData.clientType as "individual" | "organization") ||
        "organization",
      status: "new",
      archived: false,
      // Contact Information
      contact: fullData.contact as ContactInfo,
      document: fullData.document as DocumentInfo | undefined,
      // Organization Info
      organizationInfo: fullData?.organizationInfo || undefined,
      // Product Sale Details
      productSaleDetails: {
        ...(fullData?.productSaleDetails || {}),
        products: (fullData.products as ProductItem[]) || [],
      },
      // Communication
      termsAndConditions: completeFormData?.termsAndConditions || false,
      isQuoteRequest: completeFormData.isQuoteRequest,
      hostname: "iubizon.com",
      // Tracking
      tracking: {
        source: "website",
        landingPage: window.location.href,
      },
    };

    // 5. Enviar al servidor
    try {
      await sendLead(leadData);
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

  const deliveryTypes_ = deliveryTypes.filter((a) =>
    ["pickup", "local_delivery", "regional_delivery"].includes(a.value),
  );

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
                  name="isQuotation"
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
                      Solo quiero una cotización por el momento
                    </Checkbox>
                  )}
                />
                {isQuoteOnly && (
                  <Alert
                    type="success"
                    message="✓ Te contactaremos lo más pronto posible con tu cotización personalizada."
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                {!isQuoteOnly && (
                  <>
                    <Controller
                      name="deliveryOption"
                      control={control}
                      render={({ field: { onChange, value, name } }) => (
                        <RadioGroup
                          label="¿Cómo deseas recibir los productos?"
                          name={name}
                          value={value as string}
                          error={error(name)}
                          helperText={errorMessage(name)}
                          required={required(name)}
                          onChange={onChange}
                          hidden={isQuoteOnly}
                          options={deliveryTypes_}
                        />
                      )}
                    />

                    {isPickup && <BusinessAddress />}

                    {isDelivery && (
                      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 my-6">
                        <div className="sm:col-span-1">
                          <Controller
                            name="visitDate"
                            control={control}
                            render={({ field: { onChange, value, name } }) => (
                              <DatePicker
                                label="Fecha preferida de entrega"
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
                                label="Horario preferido"
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
                    name="termsAndConditions"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Checkbox
                        name={name}
                        value={value as boolean}
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

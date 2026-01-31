import { Form } from "@/components/ui/Form";
import * as yup from "yup";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { TextArea } from "@/components/ui/TextArea";
import { ProductListComponent } from "@/components/sales-and-services/ProductListComponent";
import { useNotification } from "@/components/ui/Notification";
import { useFormUtils } from "@/hooks/useFormUtils";

interface TechnicalServiceProduct {
  id: string;
  quantity: number;
  brand: string;
  model: string;
  service_type: ServiceType;
}

// Definir el tipo localmente
interface OrganizationRepairStep1 {
  products: TechnicalServiceProduct[];
  description_more_details?: string;
}

interface FormData {
  products: TechnicalServiceProduct[];
  description_more_details?: string;
}

interface Props {
  globalStep: number;
  repairsFormData: Partial<OrganizationRepairStep1>;
  setRepairsFormData: (data: Partial<OrganizationRepairStep1>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const DeviceInformationStep1 = ({
  globalStep,
  repairsFormData,
  setRepairsFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    products: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          quantity: yup
            .number()
            .required("La cantidad es requerida")
            .min(1, "La cantidad debe ser al menos 1"),
          brand: yup.string().required("La marca es requerida"),
          model: yup.string().required("El modelo es requerido"),
          service_type: yup
            .string()
            .oneOf([
              "maintenance",
              "repair",
              "installation",
              "calibration",
              "cleaning",
              "diagnosis",
              "warranty",
              "training",
              "other",
            ])
            .required("El tipo de servicio es requerido"),
        }),
      )
      .min(1, "Debes agregar al menos un producto")
      .required(),
    description_more_details: yup.string().notRequired(),
  });

  // Inicializar productos desde repairsFormData o crear uno por defecto
  const initialProducts: TechnicalServiceProduct[] =
    repairsFormData?.products && repairsFormData.products.length > 0
      ? repairsFormData.products.map((p: TechnicalServiceProduct) => ({
          id: p.id || crypto.randomUUID(),
          quantity: p.quantity || 1,
          brand: p.brand || "",
          model: p.model || "",
          service_type: p.service_type || "maintenance",
        }))
      : [
          {
            id: crypto.randomUUID(),
            quantity: 1,
            brand: "",
            model: "",
            service_type: "maintenance",
          },
        ];

  const [products, setProducts] =
    useState<TechnicalServiceProduct[]>(initialProducts);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      products: initialProducts,
      description_more_details: repairsFormData?.description_more_details || "",
    },
  });

  useEffect(() => {
    setValue("products", products);
  }, [products, setValue]);

  const { error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = async (formData: FormData) => {
    console.log({ formData });

    const hasEmptyProduct = products.some(
      (p) => !p.brand.trim() || !p.model.trim() || p.quantity < 1,
    );

    if (hasEmptyProduct) {
      showNotification(
        "warning",
        "Por favor completa la marca y modelo de todos los productos antes de continuar",
        "Productos incompletos",
      );
      return;
    }

    const completeFormData: OrganizationRepairStep1 = {
      products: formData.products.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        brand: p.brand,
        model: p.model,
        service_type: p.service_type,
      })),
      description_more_details: formData.description_more_details,
    };

    setRepairsFormData({ ...repairsFormData, ...completeFormData });
    addLocalStorageData(completeFormData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <>
      <div className="w-full">
        <div className="text-2xl text-center text-secondary font-semibold">
          Datos del equipo
        </div>
        <div className="mt-5">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full grid gap-6 mx-auto">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                <div>
                  <ProductListComponent
                    products={products}
                    onChange={(prods: TechnicalServiceProduct[]) =>
                      setProducts(prods)
                    }
                    hideServiceTypeField={false}
                  />
                </div>
                <div>
                  <Controller
                    name="description_more_details"
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <TextArea
                        label="Describa más detalles (Opcional)"
                        name={name}
                        value={value}
                        error={error(name)}
                        helperText={
                          errorMessage(name) ||
                          "Puedes agregar detalles sobre el uso, plazos, presupuesto u otra información relevante"
                        }
                        rows={3}
                        onChange={onChange}
                        placeholder="Describa más detalles sobre el servicio que necesita"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3">
                <Button block variant="primary" type="submit">
                  <div className="flex gap-2 items-center justify-center">
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            </div>
          </Form>
        </div>
        {NotificationComponent}
      </div>
    </>
  );
};

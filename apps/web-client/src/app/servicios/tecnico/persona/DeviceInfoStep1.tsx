import { Form } from "@/components/ui/Form";
import * as yup from "yup";
import { ObjectSchema } from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { TextArea } from "@/components/ui/TextArea";
import { ProductListComponent } from "@/components/sales-and-services/ProductListComponent";
import { ProductItemList } from "@/types/lead";
import { useFormUtils } from "@/hooks/useFormUtils";
import { useNotification } from "@/components/ui/Notification";
import { ServiceForPersonStep1 } from "@/app/servicios/tecnico/persona/StepsGroup";

interface Props {
  globalStep: number;
  repairsFormData: Partial<ServiceForPersonStep1>;
  setRepairsFormData: (data: Partial<ServiceForPersonStep1>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const DeviceInfoStep1 = ({
  globalStep,
  repairsFormData,
  setRepairsFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    description_more_details: yup.string().notRequired(),
  }) as ObjectSchema<Pick<ServiceForPersonStep1, "description_more_details">>;

  const initialProducts: ProductItemList[] =
    repairsFormData?.products && repairsFormData.products.length > 0
      ? repairsFormData.products.map((p) => ({
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

  const [products, setProducts] = useState<ProductItemList[]>(initialProducts);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Pick<ServiceForPersonStep1, "description_more_details">>({
    resolver: yupResolver(schema),
    defaultValues: {
      description_more_details: repairsFormData?.description_more_details || "",
    },
  });

  const { error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = async (
    formData: Pick<ServiceForPersonStep1, "description_more_details">,
  ) => {
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

    const completeFormData: ServiceForPersonStep1 = {
      products: products.map((p) => ({
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
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Datos del equipos
      </div>
      <div className="mt-5">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full grid gap-6 mx-auto">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6">
              <ProductListComponent
                products={products}
                onChange={(prods: ProductItemList[]) => setProducts(prods)}
                hideServiceTypeField={false}
              />
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
            <div className="flex justify-end">
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
  );
};

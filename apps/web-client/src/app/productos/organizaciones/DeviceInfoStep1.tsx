import { Form } from "@/components/ui/Form";
import * as yup from "yup";
import { ObjectSchema } from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormUtils } from "@/hooks/useFormUtils";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SaleForOrgStep1 } from "@/app/productos/organizaciones/StepsGroup";
import { ArrowRight } from "lucide-react";
import { TextArea } from "@/components/ui/TextArea";
import { useNotification } from "@/components/ui/Notification";
import { ProductListComponent } from "@/components/sales-and-services/ProductListComponent";
import { ProductItemList, ServiceType } from "@/types/lead";

interface Props {
  globalStep: number;
  productFormData: Partial<SaleForOrgStep1>;
  setProductFormData: (data: Partial<SaleForOrgStep1>) => void;
  addLocalStorageData: (data: object) => void;
  setCurrentStepToLocalStorage: (step: number) => void;
}

export const DeviceInfoStep1 = ({
  globalStep,
  productFormData,
  setProductFormData,
  addLocalStorageData,
  setCurrentStepToLocalStorage,
}: Props) => {
  const { showNotification, NotificationComponent } = useNotification();

  const schema = yup.object({
    description_more_details: yup.string().notRequired(),
  }) as ObjectSchema<Pick<SaleForOrgStep1, "description_more_details">>;

  // Inicializar productos para el formulario
  const initializeProducts = (): ProductItemList[] => {
    if (productFormData?.products && productFormData.products.length > 0) {
      return productFormData.products.map((p) => ({
        ...p,
        service_type: "maintenance" as ServiceType,
      }));
    }
    return [
      {
        id: crypto.randomUUID(),
        quantity: 1,
        brand: "",
        model: "",
        service_type: "maintenance",
      },
    ];
  };

  const [products, setProducts] =
    useState<ProductItemList[]>(initializeProducts());

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Pick<SaleForOrgStep1, "description_more_details">>({
    resolver: yupResolver(schema),
    defaultValues: {
      description_more_details: productFormData?.description_more_details || "",
    },
  });

  const { error, errorMessage } = useFormUtils({ errors, schema });

  const onSubmit = (
    formData: Pick<SaleForOrgStep1, "description_more_details">,
  ) => {
    // Validar productos (marca, modelo, cantidad)
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
    const completeFormData: SaleForOrgStep1 = {
      products: products.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        brand: p.brand,
        model: p.model,
      })),
      description_more_details: formData.description_more_details,
    };

    setProductFormData({ ...productFormData, ...completeFormData });
    addLocalStorageData(completeFormData);
    setCurrentStepToLocalStorage(globalStep + 1);
  };

  return (
    <div className="w-full">
      <div className="text-2xl text-center text-secondary font-semibold">
        Productos que necesitas
      </div>
      <div className="text-sm text-center text-gray-600 mt-2 mb-6">
        Agrega los productos o proyectores que tu organización requiere
      </div>
      <div className="mt-5">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full grid gap-6 mx-auto">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6">
              <ProductListComponent
                products={products}
                onChange={(prods: ProductItemList[]) => setProducts(prods)}
                hideServiceTypeField={true}
              />
              <Controller
                name="description_more_details"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <TextArea
                    label="Información adicional (Opcional)"
                    name={name}
                    value={value}
                    error={error(name)}
                    helperText={
                      errorMessage(name) ||
                      "Puedes agregar detalles sobre el uso, plazos, presupuesto u otra información relevante"
                    }
                    required={false}
                    onChange={onChange}
                    placeholder="Información adicional sobre tu solicitud..."
                    rows={4}
                  />
                )}
              />
              <div className="flex justify-end">
                <Button block variant="primary" type="submit">
                  <div className="flex gap-2 items-center justify-center">
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
      {NotificationComponent}
    </div>
  );
};

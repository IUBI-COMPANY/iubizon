import React, { forwardRef, useImperativeHandle, useState } from "react";
import { InputNumber } from "@/components/ui/InputNumber";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AlertCircle, GripVertical, Plus, X } from "lucide-react";
import { ProductItemList } from "@/types/lead";

interface Props {
  products: ProductItemList[];
  onChange: (products: ProductItemList[]) => void;
  errors?: {
    [key: string]: string | undefined;
  };
  onValidationError?: (hasErrors: boolean) => void;
  hideServiceTypeField?: boolean; // NUEVO: para ocultar el campo
}

export interface ProductListComponentRef {
  validate: () => boolean;
}

const SERVICE_TYPE_OPTIONS = [
  { label: "Mantenimiento", value: "maintenance" },
  { label: "Reparación", value: "repair" },
  { label: "Instalación", value: "installation" },
  { label: "Calibración", value: "calibration" },
  { label: "Limpieza", value: "cleaning" },
  { label: "Diagnóstico", value: "diagnosis" },
  { label: "Capacitación", value: "training" },
  { label: "Otro", value: "other" },
];

// Componente para cada producto con drag and drop nativo
interface ProductItemProps {
  product: ProductItemList;
  index: number;
  updateProduct: (
    id: string,
    field: keyof ProductItemList,
    value: string | number,
  ) => void;
  removeProduct: (id: string) => void;
  canRemove: boolean;
  errors: { [key: string]: string | undefined };
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const ProductItem = ({
  product,
  index,
  updateProduct,
  removeProduct,
  canRemove,
  errors,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  hideServiceTypeField = false, // NUEVO
}: ProductItemProps & { hideServiceTypeField?: boolean }) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      className={`flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-primary/50 transition-all duration-300 ease-in-out
        ${isDragging ? "opacity-70 scale-105 shadow-xl z-10" : "opacity-100"}
      `}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-center pt-2 text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
      </div>
      {/* Fields */}
      <div
        className={`flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:gap-4`}
      >
        {/* Quantity */}
        <div className={hideServiceTypeField ? "w-full" : "w-full sm:w-1/8"}>
          <InputNumber
            label={index === 0 ? "Cantidad" : ""}
            name={`products.${index}.quantity`}
            value={product.quantity}
            onChange={(value) => updateProduct(product.id, "quantity", value)}
            min={1}
            error={!!errors[`products.${index}.quantity`]}
            helperText={errors[`products.${index}.quantity`]}
            placeholder="1"
            required
          />
        </div>
        {/* Brand */}
        <div className={hideServiceTypeField ? "w-full" : "w-full sm:w-1/4"}>
          <Input
            label={index === 0 ? "Marca" : ""}
            name={`products.${index}.brand`}
            value={product.brand}
            onChange={(value) => updateProduct(product.id, "brand", value)}
            error={!!errors[`products.${index}.brand`]}
            helperText={errors[`products.${index}.brand`]}
            placeholder="Epson"
            required
          />
        </div>
        {/* Model */}
        <div className={hideServiceTypeField ? "w-full" : "w-full sm:w-1/4"}>
          <Input
            label={index === 0 ? "Modelo" : ""}
            name={`products.${index}.model`}
            value={product.model}
            onChange={(value) => updateProduct(product.id, "model", value)}
            error={!!errors[`products.${index}.model`]}
            helperText={errors[`products.${index}.model`]}
            placeholder="980W"
            required
          />
        </div>
        {/* Service Type (condicional) */}
        {!hideServiceTypeField && (
          <div className="w-full sm:w-1/3">
            <Select
              label={index === 0 ? "Tipo de Servicio" : ""}
              name={`products.${index}.service_type`}
              value={product.service_type}
              onChange={(value) =>
                updateProduct(product.id, "service_type", value)
              }
              error={!!errors[`products.${index}.service_type`]}
              helperText={errors[`products.${index}.service_type`]}
              placeholder="Seleccionar"
              options={SERVICE_TYPE_OPTIONS}
              required
            />
          </div>
        )}
      </div>
      {/* Remove Button */}
      <div className="pt-2">
        {canRemove && (
          <button
            type="button"
            onClick={() => removeProduct(product.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar producto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const ProductListComponent = forwardRef<ProductListComponentRef, Props>(
  (
    {
      products,
      onChange,
      errors = {},
      onValidationError,
      hideServiceTypeField = false,
    },
    ref,
  ) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showValidationAlert, setShowValidationAlert] = useState(false);
    const alertRef = React.useRef<HTMLDivElement>(null);

    // Validar si todos los productos están completos
    const validateProducts = () => {
      const incompleteProducts = products.filter(
        (product) =>
          !product.brand ||
          !product.brand.trim() ||
          !product.model ||
          !product.model.trim() ||
          !product.quantity ||
          product.quantity < 1 ||
          (!hideServiceTypeField && !product.service_type), // Solo valida service_type si no está oculto
      );
      const hasErrors = incompleteProducts.length > 0;
      if (hasErrors) {
        setShowValidationAlert(true);
        setTimeout(() => {
          alertRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
        setTimeout(() => {
          setShowValidationAlert(false);
        }, 8000);
      }
      if (onValidationError) {
        onValidationError(hasErrors);
      }
      return !hasErrors;
    };

    useImperativeHandle(ref, () => ({
      validate: validateProducts,
    }));

    const addProduct = () => {
      const newProduct: ProductItemList = {
        id: crypto.randomUUID(),
        quantity: 1,
        brand: "",
        model: "",
        service_type: "maintenance",
      };
      onChange([...products, newProduct]);
    };

    const removeProduct = (id: string) => {
      if (products.length > 1) {
        onChange(products.filter((p) => p.id !== id));
      }
    };

    const updateProduct = (
      id: string,
      field: keyof ProductItemList,
      value: string | number,
    ) => {
      onChange(
        products.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
      // Ocultar alerta cuando el usuario empieza a completar campos
      if (showValidationAlert) {
        setShowValidationAlert(false);
      }
    };

    const handleDragStart = (index: number) => {
      setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
      if (draggedIndex === null || draggedIndex === index) return;

      const newProducts = [...products];
      const draggedItem = newProducts[draggedIndex];
      newProducts.splice(draggedIndex, 1);
      newProducts.splice(index, 0, draggedItem);

      setDraggedIndex(index);
      onChange(newProducts);
    };

    const handleDragEnd = () => {
      setDraggedIndex(null);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Lista de Productos <span className="text-red-500">*</span>
          </label>
        </div>
        {/* Alerta de validación */}
        {showValidationAlert && (
          <div
            ref={alertRef}
            className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-lg animate-shake"
            role="alert"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-base font-bold text-red-900">
                ⚠️ Campos incompletos
              </p>
              <p className="text-sm text-red-700 mt-1 font-medium">
                Por favor, completa todos los campos requeridos (Marca, Modelo
                {!hideServiceTypeField ? " y Tipo de Servicio" : ""}) antes de
                continuar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowValidationAlert(false)}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Cerrar alerta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="space-y-3">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              updateProduct={updateProduct}
              removeProduct={removeProduct}
              canRemove={products.length > 1}
              errors={errors}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
              hideServiceTypeField={hideServiceTypeField}
            />
          ))}
        </div>
        {/* Add Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={addProduct}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Agregar otro producto</span>
          </div>
        </Button>
        {/* Helper Text */}
        <div className="flex items-start gap-2 text-sm text-amber-600">
          <span className="text-lg">💡</span>
          <span>Arrastra los productos para reordenarlos</span>
        </div>
      </div>
    );
  },
);

ProductListComponent.displayName = "ProductListComponent";

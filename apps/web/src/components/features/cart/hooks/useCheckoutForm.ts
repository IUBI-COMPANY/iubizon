"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  FORM_STORAGE_KEY,
  STEP_STORAGE_KEY,
  buildCityLabel,
  shippingFormSchema,
  type ShippingFormState,
} from "../checkout-schema";

interface UseCheckoutFormOptions {
  user?: { name?: string | null; email?: string | null } | null;
}

export function useCheckoutForm({ user }: UseCheckoutFormOptions = {}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ShippingFormState>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      email: user?.email || "",
      address: "",
      department: "Lima",
      province: "Lima",
      district: "",
      documentType: "dni",
      documentNumber: "",
      city: "Lima",
      notes: "",
    },
  });

  const shippingForm = watch();

  // Restaurar formulario desde LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedForm) {
        try {
          const parsedForm = JSON.parse(savedForm);
          reset((prev) => ({ ...prev, ...parsedForm }));
        } catch (e) {
          console.error("Error al restaurar formulario de checkout:", e);
        }
      }
    }
  }, [reset]);

  // Persistir en LocalStorage al cambiar cualquier campo
  useEffect(() => {
    const subscription = watch((value) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Sincronizar email/nombre cuando el usuario inicie sesión
  useEffect(() => {
    if (user) {
      if (!getValues("name")) setValue("name", user.name || "");
      if (!getValues("email")) setValue("email", user.email || "");
    }
  }, [user, getValues, setValue]);

  // Provincias y distritos derivados según Ubigeo
  const provincesForDepartment = useMemo(
    () =>
      peruUbigeo.find((d) => d.name === shippingForm.department)?.provinces ||
      [],
    [shippingForm.department],
  );

  const districtsForProvince = useMemo(
    () =>
      provincesForDepartment.find((p) => p.name === shippingForm.province)
        ?.districts || [],
    [provincesForDepartment, shippingForm.province],
  );

  const hasValidProvinceDocument = useMemo(() => {
    const docTypeValue = shippingForm.documentType;
    const docNumber = (shippingForm.documentNumber || "").trim();
    const isDniValid = docTypeValue === "dni" && /^\d{8}$/.test(docNumber);
    const isRucValid = docTypeValue === "ruc" && /^\d{11}$/.test(docNumber);
    return isDniValid || isRucValid;
  }, [shippingForm.documentType, shippingForm.documentNumber]);

  // Selección en cascada Ubigeo
  const handleDepartmentChange = (department: string) => {
    setValue("department", department, { shouldValidate: true });
    setValue("province", "", { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
    setValue("city", buildCityLabel(department, "", ""));
  };

  const handleProvinceChange = (province: string) => {
    setValue("province", province, { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
    setValue("city", buildCityLabel(shippingForm.department, province, ""));
  };

  const handleDistrictChange = (district: string) => {
    setValue("district", district, { shouldValidate: true });
    setValue(
      "city",
      buildCityLabel(shippingForm.department, shippingForm.province, district),
    );
  };

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    errors,
    shippingForm,
    provincesForDepartment,
    districtsForProvince,
    hasValidProvinceDocument,
    handleDepartmentChange,
    handleProvinceChange,
    handleDistrictChange,
  };
}

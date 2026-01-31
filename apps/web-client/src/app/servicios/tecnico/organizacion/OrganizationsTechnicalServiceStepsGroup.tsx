"use client";

import { useEffect, useRef, useState } from "react";
import { StepsRepairsContactForm } from "@/components/ui/StepsRepairsContactForm";
import { Loader2, Projector, User, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeviceInformationStep1 } from "@/app/servicios/tecnico/organizacion/DeviceInformationStep1";
import { OrganizationInfoStep2 } from "@/app/servicios/tecnico/organizacion/OrganizationInfoStep2";
import { OrganizationDeliveryStep3 } from "@/app/servicios/tecnico/organizacion/OrganizationDeliveryStep3";
import { NotificationWithConfetii } from "@/components/sales-and-services/NotificationWithConfetii";

const STORAGE_KEYS = {
  currentStep: "organization_currentStep",
  formData: "organization_formData",
};

export type OrganizationRepairStep2 = {
  contact: ContactInfo;
  document?: DocumentInfo;
  client_type: "individual" | "organization";
  organization_info?: {
    company_name?: string;
    tax_id?: string;
  };
};

export type OrganizationRepairStep3 = {
  service_details?: ServiceDetails;
  visit_schedule?: VisitSchedule;
  address?: AddressInfo;
  terms_and_conditions: boolean;
};

export const OrganizationsTechnicalServiceStepsGroup = () => {
  const [globalStep, setGlobalStep] = useState<number>(0);
  const [repairsFormData, setRepairsFormData] = useState<
    Partial<LeadForIubizon>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const formRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stepsData = Number(
      localStorage.getItem(STORAGE_KEYS.currentStep) || 0,
    );
    if (stepsData !== null) {
      setCurrentStepToLocalStorage(stepsData);
    }
  }, []);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.formData) || "{}",
    );
    setRepairsFormData(data);
    setLoading(false);
  }, [globalStep]);

  const addLocalStorageData = (data: object) => {
    const currentLocalData = getLocalStorageData();
    const newData = { ...currentLocalData, ...data };
    localStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(newData));
  };

  const setCurrentStepToLocalStorage = (step: number) => {
    localStorage.setItem(STORAGE_KEYS.currentStep, JSON.stringify(step));
    setGlobalStep(step);

    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const getLocalStorageData = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.formData) || "{}");
  };

  const stepItems = [
    {
      step: 0,
      label: "Equipo",
      classButton: "flex items-center justify-center rounded-l-full",
      icon: <Projector />,
    },
    {
      step: 1,
      label: "Contacto",
      classButton: "flex items-center rounded-none justify-center",
      icon: <User />,
    },
    {
      step: 2,
      label: "Visita",
      classButton: "flex items-center justify-center rounded-r-full",
      icon: <Wrench />,
    },
  ];

  useEffect(() => {
    if (globalStep === 3) {
      setCountdown(8);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem(STORAGE_KEYS.currentStep);
            localStorage.removeItem(STORAGE_KEYS.formData);
            setTimeout(() => {
              window.location.href = "/servicios/tecnico/organizacion";
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [globalStep, router]);

  const normalizeProducts = (products: ProductItem[] = []) =>
    products.map((p) => ({
      ...p,
      service_type: p.service_type ?? "maintenance", // Valor por defecto
    }));

  return loading ? (
    <div className="w-full h-full min-h-[40svh] grid place-items-center">
      <Loader2 className="w-20 h-20 text-primary animate-spin" />
    </div>
  ) : (
    <div ref={formRef} className="grid gap-5 pb-10 w-full max-w-3xl mx-auto">
      <StepsRepairsContactForm
        items={stepItems}
        globalStep={globalStep}
        setGlobalStep={setCurrentStepToLocalStorage}
      />
      <div className="w-full max-w-3xl mx-auto shadow-lg  py-10 px-6 rounded-2xl bg-white border-2 border-solid border-primary">
        {globalStep === 0 && (
          <DeviceInformationStep1
            globalStep={globalStep}
            repairsFormData={{
              ...repairsFormData,
              products: normalizeProducts(repairsFormData.products),
            }}
            setRepairsFormData={setRepairsFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 1 && (
          <OrganizationInfoStep2
            globalStep={globalStep}
            repairsFormData={repairsFormData}
            setRepairsFormData={setRepairsFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 2 && (
          <OrganizationDeliveryStep3
            loading={submitting}
            setLoading={setSubmitting}
            globalStep={globalStep}
            repairsFormData={repairsFormData}
            setRepairsFormData={setRepairsFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 3 && (
          <NotificationWithConfetii formRef={formRef} countdown={countdown} />
        )}
      </div>
    </div>
  );
};

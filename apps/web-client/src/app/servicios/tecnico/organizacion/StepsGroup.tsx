"use client";

import { useEffect, useRef, useState } from "react";
import { StepItem } from "@/components/ui/StepItem";
import { Loader2, Projector, User, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeviceInfoStep1 } from "@/app/servicios/tecnico/organizacion/DeviceInfoStep1";
import { ContactOrgInfoStep2 } from "@/app/servicios/tecnico/organizacion/ContactOrgInfoStep2";
import { ServiceTypeStep3 } from "@/app/servicios/tecnico/organizacion/ServiceTypeStep3";
import { NotificationWithConfetii } from "@/components/sales-and-services/NotificationWithConfetii";

const STORAGE_KEYS = {
  currentStep: "organization_currentStep",
  formData: "organization_formData",
};

export type ServiceForOrgStep1 = {
  products: ProductItem[];
  description_more_details?: string;
};

export type ServiceForOrgStep2 = {
  contact: ContactInfo;
  document?: DocumentInfo;
  client_type: ClientType;
  organization_info?: {
    company_name?: string;
    tax_id?: string;
  };
};

export type ServiceForOrgStep3 = {
  service_details?: ServiceDetails;
  visit_schedule?: VisitSchedule;
  address?: AddressInfo;
  terms_and_conditions: boolean;
};

export const StepsGroup = () => {
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
      label: "Tipo servicio",
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

  return loading ? (
    <div className="w-full h-full min-h-[40svh] grid place-items-center">
      <Loader2 className="w-20 h-20 text-primary animate-spin" />
    </div>
  ) : (
    <div ref={formRef} className="grid gap-5 pb-10 w-full max-w-3xl mx-auto">
      <StepItem
        items={stepItems}
        globalStep={globalStep}
        setGlobalStep={setCurrentStepToLocalStorage}
      />
      <div className="w-full max-w-3xl mx-auto shadow-lg  py-10 px-6 rounded-2xl bg-white border-2 border-solid border-primary">
        {globalStep === 0 && (
          <DeviceInfoStep1
            globalStep={globalStep}
            repairsFormData={repairsFormData}
            setRepairsFormData={setRepairsFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 1 && (
          <ContactOrgInfoStep2
            globalStep={globalStep}
            repairsFormData={repairsFormData}
            setRepairsFormData={setRepairsFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 2 && (
          <ServiceTypeStep3
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

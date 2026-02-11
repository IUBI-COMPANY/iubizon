"use client";

import { useEffect, useRef, useState } from "react";
import { StepItem } from "@/components/ui/StepItem";
import { CircleCheck, Loader2, Package, User, Truck } from "lucide-react";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { DeviceInfoStep1 } from "@/app/productos/pedido/DeviceInfoStep1";
import { ContactInfoStep2 } from "@/app/productos/pedido/ContactInfoStep2";
import { DeliveryStep3 } from "@/app/productos/pedido/DeliveryStep3";

const STORAGE_KEYS = {
  currentStep: "org_products_currentStep",
  formData: "org_products_formData",
};

export type AnOrderStep1 = {
  products: ProductItem[];
  additionalInformation?: string;
};

export type AnOrderStep2 = {
  contact: ContactInfo;
  document?: DocumentInfo;
  clientType: ClientType;
  organizationInfo?: {
    companyName?: string;
    taxId?: string;
  };
};

export const StepsGroup = () => {
  const [globalStep, setGlobalStep] = useState(0);
  const [leadFormData, setLeadFormData] = useState<Partial<Lead>>({});
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
    setLeadFormData(data);
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
      label: "Productos",
      classButton: "flex items-center justify-center rounded-l-full",
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      step: 1,
      label: "Contacto",
      classButton: "flex items-center rounded-none justify-center",
      icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      step: 2,
      label: "Tipo de entrega",
      classButton: "flex items-center justify-center rounded-r-full",
      icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
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
              window.location.href = "/productos/pedido";
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
    <div
      ref={formRef}
      className="grid gap-5 pb-10 w-full max-w-2xl mx-auto px-2 sm:px-4"
    >
      <StepItem
        items={stepItems}
        globalStep={globalStep}
        setGlobalStep={setCurrentStepToLocalStorage}
      />
      <div className="w-full max-w-2xl mx-auto shadow-lg py-6 sm:py-10 px-4 sm:px-6 rounded-2xl bg-white border-2 border-solid border-primary">
        {globalStep === 0 && (
          <DeviceInfoStep1
            globalStep={globalStep}
            leadFormData={leadFormData}
            setLeadFormData={setLeadFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 1 && (
          <ContactInfoStep2
            globalStep={globalStep}
            leadFormData={leadFormData}
            setLeadFormData={setLeadFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 2 && (
          <DeliveryStep3
            loading={submitting}
            setLoading={setSubmitting}
            globalStep={globalStep}
            leadFormData={leadFormData}
            setLeadFormData={setLeadFormData}
            addLocalStorageData={addLocalStorageData}
            setCurrentStepToLocalStorage={setCurrentStepToLocalStorage}
          />
        )}
        {globalStep === 3 && (
          <div className="w-full h-full grid sm:grid-cols-2 place-items-center relative overflow-hidden">
            <Image
              width={1000}
              height={1000}
              src="/images/iubizon-pet.png"
              alt="iubizonpet"
              className="w-full h-auto"
            />
            <div className="grid place-items-center gap-4 relative">
              <CircleCheck className="w-20 h-20 text-green-600" />
              <div className="text-center space-y-3 max-w-md">
                <h2 className="text-2xl font-bold text-secondary">
                  ¡Solicitud enviada!
                </h2>
                <p className="text-gray-700">
                  Nuestro equipo de ventas te contactará pronto con una
                  cotización personalizada.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-400 rounded-r-lg p-3">
                  <p className="text-sm text-blue-900 flex items-center gap-2">
                    <span className="text-lg">📧</span>
                    <span>
                      <strong>Confirmación enviada</strong> a tu correo con
                      todos los detalles
                    </span>
                  </p>
                </div>
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 text-center">
                    Redirigiendo en{" "}
                    <span className="font-bold text-primary">{countdown}</span>{" "}
                    segundo{countdown !== 1 ? "s" : ""}...
                  </p>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Gracias por confiar en nosotros 📦
                </p>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <Confetti
                width={formRef.current?.offsetWidth || 400}
                height={formRef.current?.offsetHeight || 600}
                recycle={false}
                numberOfPieces={100}
                gravity={0.3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

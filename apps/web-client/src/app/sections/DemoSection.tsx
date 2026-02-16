"use client";
import React, { useState } from "react";
import * as yup from "yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Calendar,
  MapPin,
  Truck,
  Store,
  ChevronRight,
  Check,
} from "lucide-react";
import { BusinessAddress } from "@/components/ui/BusinessAddress";
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  isValidVisitDate,
  isValidVisitTime,
} from "@/utils/validateDatetimeToSupportInformation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { useFormUtils } from "@/hooks/useFormUtils";

interface FormDataStep1 {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
}

interface FormDataStep2 {
  modalidad: AttendanceType;
  fecha?: string;
  hora?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion?: string;
}

export const DemoSection: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<FormDataStep1>({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
  });

  // Schema para Step 1
  const schemaStep1 = yup.object({
    nombre: yup.string().required("El nombre es requerido"),
    email: yup
      .string()
      .email("Email inválido")
      .required("El email es requerido"),
    telefono: yup.string().required("El teléfono es requerido"),
    empresa: yup.string().required("La empresa es requerida"),
  });

  // Schema para Step 2
  const schemaStep2 = yup.object({
    modalidad: yup.string().required("Debes seleccionar una modalidad"),
    fecha: yup.string().when("modalidad", {
      is: "at_customer",
      then: (schema) =>
        schema
          .required("La fecha es requerida")
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
    hora: yup.string().when("modalidad", {
      is: "at_customer",
      then: (schema) =>
        schema
          .required("La hora es requerida")
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
              const fecha = this.parent.fecha;
              return isValidVisitTime(value, fecha);
            },
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    distrito: yup.string().when("modalidad", {
      is: (value: string) => ["at_customer", "send_to_store"].includes(value),
      then: (schema) => schema.required("El distrito es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    direccion: yup.string().when("modalidad", {
      is: (value: string) => ["at_customer", "send_to_store"].includes(value),
      then: (schema) => schema.required("La dirección es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    departamento: yup.string().when("modalidad", {
      is: "send_to_store",
      then: (schema) => schema.required("El departamento es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    provincia: yup.string().when("modalidad", {
      is: "send_to_store",
      then: (schema) => schema.required("La provincia es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Form Step 1
  const {
    handleSubmit: handleSubmitStep1,
    control: controlStep1,
    formState: { errors: errorsStep1 },
  } = useForm<FormDataStep1>({
    resolver: yupResolver(schemaStep1) as unknown as Resolver<FormDataStep1>,
    defaultValues: step1Data,
  });

  const {
    required: requiredStep1,
    error: errorStep1,
    errorMessage: errorMessageStep1,
  } = useFormUtils({ errors: errorsStep1, schema: schemaStep1 });

  // Form Step 2
  const {
    handleSubmit: handleSubmitStep2,
    control: controlStep2,
    formState: { errors: errorsStep2 },
    watch,
  } = useForm<FormDataStep2>({
    resolver: yupResolver(schemaStep2) as unknown as Resolver<FormDataStep2>,
    defaultValues: {
      modalidad: "" as AttendanceType,
      fecha: "",
      hora: "",
      departamento: "",
      provincia: "",
      distrito: "",
      direccion: "",
    },
  });

  const {
    required: requiredStep2,
    error: errorStep2,
    errorMessage: errorMessageStep2,
  } = useFormUtils({ errors: errorsStep2, schema: schemaStep2 });

  const modalidadSelected = watch("modalidad");
  const departamentoSelected = watch("departamento");
  const provinciaSelected = watch("provincia");

  const _departamentoSelected = peruUbigeo.find(
    (dep) => dep.name === departamentoSelected,
  );
  const _provinciaSelected = _departamentoSelected?.provinces.find(
    (prov) => prov.name === provinciaSelected,
  );

  const districtsByLimaProvince = peruUbigeo[13].provinces[0].districts;

  const onSubmitStep1 = (data: FormDataStep1) => {
    setStep1Data(data);
    setStep(2);
  };

  const onSubmitStep2 = (data: FormDataStep2) => {
    // Construir mensaje para WhatsApp
    const mensaje = `
🎯 *Solicitud de Demo - Bundle Interactivo*

📋 *Datos de Contacto:*
• Nombre: ${step1Data.nombre}
• Email: ${step1Data.email}
• Teléfono: ${step1Data.telefono}
• Empresa: ${step1Data.empresa}

📦 *Modalidad:* ${
      data.modalidad === "at_customer"
        ? "🏢 Visita a mi ubicación"
        : data.modalidad === "send_to_store"
          ? "🚚 Envío de equipo al local"
          : "🏪 Recojo en local"
    }

${data.direccion ? `📍 Dirección: ${data.direccion}` : ""}
${data.distrito ? `🏘️ Distrito: ${data.distrito}` : ""}
${data.provincia ? `🌆 Provincia: ${data.provincia}` : ""}
${data.departamento ? `🗺️ Departamento: ${data.departamento}` : ""}
${data.fecha ? `📅 Fecha preferida: ${data.fecha}` : ""}
${data.hora ? `🕐 Hora preferida: ${data.hora}` : ""}
    `.trim();

    const whatsappUrl = `https://wa.me/51972300301?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, "_blank");
  };

  const modalidades = [
    {
      value: "at_customer",
      label: "Visita a tu ubicación",
      description: "Agendamos una demo en tu oficina o institución",
      icon: MapPin,
    },
    {
      value: "send_to_store",
      label: "Envío de equipo",
      description: "Envíanos tu equipo y te mostramos cómo integrarlo",
      icon: Truck,
    },
    {
      value: "on_site",
      label: "Recojo en local",
      description: "Ven a nuestro local y conoce el producto en vivo",
      icon: Store,
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-[#060e1e] to-[#0a1428] relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">
              Agenda tu demo
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Prueba el Bundle Interactivo
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Agenda una demostración personalizada y descubre cómo transformar
            tus presentaciones
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-gray-500"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 1
                  ? "bg-primary text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className="font-semibold hidden sm:inline">Tus datos</span>
          </div>
          <div className="w-16 h-1 bg-gray-700"></div>
          <div
            className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-gray-500"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 2
                  ? "bg-primary text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              2
            </div>
            <span className="font-semibold hidden sm:inline">Modalidad</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Step 1: Datos personales */}
          {step === 1 && (
            <form
              onSubmit={handleSubmitStep1(onSubmitStep1)}
              className="space-y-6 animate-fadeIn"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Controller
                  name="nombre"
                  control={controlStep1}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Nombre completo"
                      placeholder="Juan Pérez"
                      name={name}
                      value={value}
                      error={errorStep1(name)}
                      helperText={errorMessageStep1(name)}
                      required={requiredStep1(name)}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={controlStep1}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Correo electrónico"
                      type="email"
                      placeholder="juan@empresa.com"
                      name={name}
                      value={value}
                      error={errorStep1(name)}
                      helperText={errorMessageStep1(name)}
                      required={requiredStep1(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Controller
                  name="telefono"
                  control={controlStep1}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Teléfono / WhatsApp"
                      type="tel"
                      placeholder="+51 999 999 999"
                      name={name}
                      value={value}
                      error={errorStep1(name)}
                      helperText={errorMessageStep1(name)}
                      required={requiredStep1(name)}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  name="empresa"
                  control={controlStep1}
                  render={({ field: { onChange, value, name } }) => (
                    <Input
                      label="Empresa / Institución"
                      placeholder="Mi Empresa S.A.C."
                      name={name}
                      value={value}
                      error={errorStep1(name)}
                      helperText={errorMessageStep1(name)}
                      required={requiredStep1(name)}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/30"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Step 2: Modalidad */}
          {step === 2 && (
            <form
              onSubmit={handleSubmitStep2(onSubmitStep2)}
              className="space-y-6 animate-fadeIn "
            >
              <Controller
                name="modalidad"
                control={controlStep2}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup
                    label="¿Cómo te gustaría recibir tu demo?"
                    name={name}
                    value={value as string}
                    error={errorStep2(name)}
                    helperText={errorMessageStep2(name)}
                    required={requiredStep2(name)}
                    onChange={onChange}
                    options={modalidades}
                    theme="dark"
                  />
                )}
              />

              {/* Mostrar BusinessAddress cuando es recojo en local */}
              {modalidadSelected === "on_site" && (
                <div className="mt-6">
                  <BusinessAddress />
                </div>
              )}

              {/* Campos para visita a domicilio */}
              {modalidadSelected === "at_customer" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Controller
                      name="fecha"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <DatePicker
                          label="Fecha preferida"
                          name={name}
                          value={value as string}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                        />
                      )}
                    />
                    <Controller
                      name="hora"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <TimePicker
                          label="Hora preferida"
                          name={name}
                          value={value}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Controller
                      name="distrito"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <Select
                          label="Distrito"
                          placeholder="Seleccionar"
                          name={name}
                          value={value}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                          options={districtsByLimaProvince.map((dist) => ({
                            value: dist.name,
                            label: dist.name,
                          }))}
                        />
                      )}
                    />
                    <div className="md:col-span-2">
                      <Controller
                        name="direccion"
                        control={controlStep2}
                        render={({ field: { onChange, value, name } }) => (
                          <Input
                            label="Dirección"
                            placeholder="Av. Principal 123"
                            name={name}
                            value={value}
                            error={errorStep2(name)}
                            helperText={errorMessageStep2(name)}
                            required={requiredStep2(name)}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos para envío */}
              {modalidadSelected === "send_to_store" && (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-sm">
                      ℹ️ Necesitamos tu dirección para poder enviarte el equipo
                      después de la demostración.
                    </p>
                  </div>
                  <BusinessAddress />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Controller
                      name="departamento"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <Select
                          label="Departamento"
                          placeholder="Seleccionar"
                          name={name}
                          value={value}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                          options={peruUbigeo.map((dep) => ({
                            value: dep.name,
                            label: dep.name,
                          }))}
                        />
                      )}
                    />
                    <Controller
                      name="provincia"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <Select
                          label="Provincia"
                          placeholder="Seleccionar"
                          name={name}
                          value={value}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                          options={
                            _departamentoSelected?.provinces.map((prov) => ({
                              value: prov.name,
                              label: prov.name,
                            })) || []
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Controller
                      name="distrito"
                      control={controlStep2}
                      render={({ field: { onChange, value, name } }) => (
                        <Select
                          label="Distrito"
                          placeholder="Seleccionar"
                          name={name}
                          value={value}
                          error={errorStep2(name)}
                          helperText={errorMessageStep2(name)}
                          required={requiredStep2(name)}
                          onChange={onChange}
                          options={
                            _provinciaSelected?.districts.map((dist) => ({
                              value: dist.name,
                              label: dist.name,
                            })) || []
                          }
                        />
                      )}
                    />
                    <div className="md:col-span-2">
                      <Controller
                        name="direccion"
                        control={controlStep2}
                        render={({ field: { onChange, value, name } }) => (
                          <Input
                            label="Dirección"
                            placeholder="Av. Principal 123"
                            name={name}
                            value={value}
                            error={errorStep2(name)}
                            helperText={errorMessageStep2(name)}
                            required={requiredStep2(name)}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/30"
                >
                  Enviar solicitud
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};

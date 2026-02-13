import { TechnicalSpec } from "@/types/bundleTypes";

export const PROJECTOR_SPECS: TechnicalSpec[] = [
  {
    iconName: "Lightbulb",
    label: "Alta Luminosidad",
    value: "Desde 4000 hasta 7000 lúmenes según modelo",
  },
  {
    iconName: "Zap",
    label: "Tecnología Avanzada",
    value: "Proyección láser de larga duración",
  },
  {
    iconName: "Maximize2",
    label: "Área de Proyección",
    value: 'Hasta 120" de superficie dinámica',
  },
  {
    iconName: "Cable",
    label: "Conectividad",
    value: "HDMI, VGA, USB y conexión inalámbrica",
  },
];

export const TOUCH_SPECS: TechnicalSpec[] = [
  {
    iconName: "Target",
    label: "Hub Interactivo",
    value: "Transformación táctil de alta precisión",
  },
  {
    iconName: "Hand",
    label: "Multi-Touch",
    value: "10 puntos táctiles + Multi-usuario simultáneo",
  },
  {
    iconName: "Radio",
    label: "Tecnología Óptica",
    value: "Sensor infrarrojo de baja latencia",
  },
  {
    iconName: "Laptop",
    label: "Compatibilidad",
    value: "Windows, Mac, Android y Linux",
  },
];

export const MIRACAST_SPECS: TechnicalSpec[] = [
  {
    iconName: "Wifi",
    label: "Streaming Inalámbrico",
    value: "Transmisión nativa compatible con Android",
  },
  {
    iconName: "Smartphone",
    label: "Aplicaciones",
    value: "Acceso a Google Play Store y apps educativas",
  },
  {
    iconName: "Globe",
    label: "Conectividad WiFi",
    value: "Comparte contenido desde cualquier dispositivo",
  },
  {
    iconName: "Bot",
    label: "Sistema Operativo",
    value: "Android integrado para máxima versatilidad",
  },
];

// Mantener export para compatibilidad (opcional)
export const SPECS: TechnicalSpec[] = [
  ...PROJECTOR_SPECS,
  ...TOUCH_SPECS,
  ...MIRACAST_SPECS,
];

import { TechnicalSpec } from "@/types/bundleTypes";

export interface ProductSpecs {
  id: string;
  name: string;
  image: string;
  specs: TechnicalSpec[];
}

export const PROJECTOR_SPECS: TechnicalSpec[] = [
  {
    iconName: "Lightbulb",
    label: "Alta Luminosidad",
    value: "4000 Lúmenes ANSI para un gran brillo de proyección",
  },
  {
    iconName: "Zap",
    label: "Tecnología Avanzada",
    value: "Proyección 3LCD de larga duración",
  },
  {
    iconName: "Clock",
    label: "Gran duración",
    value: "Hasta 12000 horas de uso",
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
    value: "Múltiples puntos touch para colaboración simultánea",
  },
  {
    iconName: "Radio",
    label: "Tecnología Óptica",
    value: "Sensor infrarrojo de baja latencia",
  },
  {
    iconName: "Laptop",
    label: "Compatibilidad",
    value: "Windows y Mac",
  },
];

export const ADAPTADOR_WIFI_SPECS: TechnicalSpec[] = [
  {
    iconName: "Wifi",
    label: "Streaming Inalámbrico",
    value: "Transmisión nativa compatible con cualquier dispositivo",
  },
  {
    iconName: "Globe",
    label: "Conectividad WiFi",
    value: "Comparte contenido desde cualquier dispositivo",
  },
  {
    iconName: "Bot",
    label: "Velocidad Premium",
    value:
      "Transmisión rápida y sin interrupciones para presentaciones profesionales",
  },
];

// Exportar productos con sus especificaciones completas
export const BUNDLE_PRODUCTS_SPECS: ProductSpecs[] = [
  {
    id: "proyector",
    name: "Proyector Epson 109W",
    image: "/productos/bundle/upside109W.png",
    specs: PROJECTOR_SPECS,
  },
  {
    id: "touch",
    name: "Touch Interactivo Hub 2",
    image: "/productos/bundle/touch1.png",
    specs: TOUCH_SPECS,
  },
  {
    id: "adaptador-inalambrico",
    name: "Adaptador Inalámbrico WiFi",
    image: "/productos/bundle/adaptador-wifi1.png",
    specs: ADAPTADOR_WIFI_SPECS,
  },
];

// Mantener export para compatibilidad (opcional)
export const SPECS: TechnicalSpec[] = [
  ...PROJECTOR_SPECS,
  ...TOUCH_SPECS,
  ...ADAPTADOR_WIFI_SPECS,
];

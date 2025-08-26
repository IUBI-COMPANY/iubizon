import { ReactNode } from "react";

export interface Product {
  id: string;
  model: string;
  name?: string;
  oldStock?: number;
  units: number;
  description?: string;
  price: number;
  sub?: string;
  badge?: string;
  mainImage?: string;
  media: MediaItem[];
  condition?: string;
  imageBrightness?: string;
  brand?: string;
  type?: string;
  contrastRatio?: string;
  connectivity?: string;
  features?: string;
  nativeResolution?: string;
  aspectRatio?: string;
  throwRatio?: string;
  category?: string[];
  note?: string | ReactNode;
}

export interface MediaItem {
  type: string;
  src: string;
}

export const products: Product[] = [
  {
    id: "98H",
    model: "H687A",
    name: "Proyector Epson 98H",
    oldStock: 12,
    units: 4,
    price: 700,
    badge: "Oferta",
    mainImage: "/images/98H/98h.jpg",
    media: [
      { type: "image", src: "/images/98H/2.jpg" },
      { type: "video", src: "/videos/98H.mp4" },
      { type: "image", src: "/images/98H/3.jpg" },
      { type: "image", src: "/images/98H/4.jpg" },
      { type: "image", src: "/images/98H/5.jpg" },
    ],
    condition:
      "Usado: Un artículo que ha sido utilizado previamente. El artículo puede tener algunas señales de desgaste cosmético, pero es completamente funcional y opera como se espera. Este artículo puede ser un modelo de exhibición o una devolución de tienda que ha sido usado. Consulta la descripción del vendedor para más detalles y descripción de cualquier imperfección.",
    imageBrightness: "2700 lúmenes ANSI",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "10,000:1",
    connectivity: "HDMI estándar, VGA/SVGA D-Sub",
    features: "Altavoces integrados",
    nativeResolution: "1024 x 768",
    aspectRatio: "4:3",
    throwRatio: "Proyección media/estándar",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `Con una conectividad de red avanzada y una calidad de imagen excepcional, el PowerLite 98H          
    ofrece una gran opción para cualquier tipo de sala. La tecnología 3LCD ofrece colores hasta 3x mas 
    brillantes que otros modelos de la competencia. Los proyectores Epson aseguran imágenes brillantes 
    y vívidas. Confiable y fácil de usar, el PowerLite 98H cuanta con una resolución XGA, 3.000 lúmenes 
    de brillo en color y 3.000 lúmenes de brillo en blanco. Proyecte y controle la imagen desde múltiples 
    dispositivos gracias a la nueva función moderador, compartiendo fácilmente el contenido con la audiencia. 
    Versátil y funcional, el PowerLite 98H cuenta con conectividad HDMI y funciones de audio premium.`,
  },
  {
    id: "980W",
    model: "H866A",
    name: "Proyector Epson 980W",
    units: 5,
    description: "Buena proyección, detalles estéticos",
    price: 1100,
    badge: "Top venta",
    mainImage: "/images/980W/980w.jpg",
    media: [
      { type: "image", src: "/images/980W/2.png" },
      { type: "video", src: "/videos/980W.mp4" },
      { type: "image", src: "/images/980W/3.png" },
      { type: "image", src: "/images/980W/4.png" },
      { type: "image", src: "/images/980W/5.png" },
    ],
    condition: "Exhibición",
    imageBrightness: "3800 lúmenes",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "15,000:1",
    connectivity: "HDMI/MHL",
    nativeResolution: "WXGA (1280 x 800)",
    aspectRatio: "16:10",
    throwRatio: "1.38 (Zoom:Wide), 2.24 (Zoom:Tele)",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `
    Proyector ideal para aulas de estudio bien iluminadas y pequeños auditorios.  Resolución WXGA ideal para presentaciones multimedia.  Lámpara con durabilidad de hasta 12,000 horas.
    Colores tres veces más brillantes, Luminosidad en Color y Excelente calidad.
    `,
  },
  {
    id: "975W",
    model: "H835A",
    name: "Proyector Epson 975W",
    units: 3,
    description: "Buena proyección, detalles estéticos",
    price: 1100,
    mainImage: "/images/975W/975w.jpg",
    media: [
      { type: "image", src: "/images/975W/2.jpg" },
      { type: "video", src: "/videos/975W.mp4" },
      { type: "image", src: "/images/975W/3.jpg" },
      { type: "image", src: "/images/975W/4.jpg" },
      { type: "image", src: "/images/975W/5.jpg" },
    ],
    condition: "Exhibición",
    imageBrightness: "3600 lúmenes",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "15,000:1",
    connectivity: "HDMI/MHL",
    features: "",
    nativeResolution: "WXGA (1280 × 800)",
    aspectRatio: "16:10",
    throwRatio: "1.38 (Zoom: Wide) – 2.24 (Zoom: Tele)",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `El videoproyector PowerLite 975W ofrece una resolución Wide que se adapta a computadoras, tabletas y dispositivos móviles.  Ofrece una  luminosidad de 3.600 lúmenes en color y blanco para presentaciones brillantes. Alta conectividad, Miracast,  HDMI, Inalámbrica.
    Epson PowerLite 975W es el mejor proyector para el aula de clase o sala de reuninoes.  Cuenta con 3.600 lúmenes de brillo en color y blanco otorgando imágenes claras.  Su lámpara de 10,000 horas en modo Normal lo convierte en tu mejor aliado en costo de operación.`,
  },
  {
    id: "1925W",
    model: "V11H314020",
    name: "Proyector Epson 1925W",
    units: 1,
    description: "Buena proyección, detalles estéticos",
    price: 1200,
    mainImage: "/images/1925W/1925w.jpg",
    media: [
      { type: "image", src: "/images/1925W/2.jpg" },
      { type: "video", src: "/videos/1925W.mp4" },
      { type: "image", src: "/images/1925W/3.jpg" },
      { type: "image", src: "/images/1925W/4.jpg" },
      { type: "image", src: "/images/1925W/5.jpg" },
    ],
    condition: "Exhibición",
    imageBrightness: "4,000 lúmenes ANSI",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "2.000:1",
    connectivity: "HDMI/MHL",
    features: "",
    nativeResolution: "1280x800",
    aspectRatio: "16:10",
    throwRatio: "",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `Este potente proyector produce imágenes vívidas y de alta calidad, pero aún incluye una serie de características fáciles de usar, como un módulo inalámbrico para una fácil configuración inalámbrica. Con la tecnología Epson 3LCD y 4000 lúmenes de salida de luz de color y blanco, tus presentaciones aparecerán en cualquier entorno. Con conectividad digital HDMI y resolución WXGA, puede proyectar películas HD y más. Red de conectividad: RJ-45, LAN, S-Video, USB x 3, Estándar HDMI, VGA/SVGA D-Sub Modos de vídeo 720p, 1080i, 480p, 480i`,
  },
  {
    id: "970",
    model: "H865A",
    name: "Proyector Epson 970",
    units: 1,
    description: "Bajo brillo, detalles estéticos",
    price: 850,
    mainImage: "/images/970/970.jpg",
    media: [
      { type: "image", src: "/images/970/2.jpg" },
      { type: "video", src: "/videos/970.mp4" },
      { type: "image", src: "/images/970/3.jpg" },
      { type: "image", src: "/images/970/4.jpg" },
      { type: "image", src: "/images/970/5.jpg" },
    ],
    condition: "Exhibición",
    imageBrightness: "4000 lúmenes",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "15,000:1",
    connectivity: "HDMI/MHL",
    features: "",
    nativeResolution: "XGA (1024 x 768 pixeles)",
    aspectRatio: "4:3",
    throwRatio: "Proyección media/estándar",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `PowerLite 970 es la mejor herramienta de proyección para aulas bien iluminadas o pequeños auditorios. Gran rendimiento ya que ofrece una resolución XGA óptima para hojas de cálculo en adelante. Su lámpara tiene una duración hasta de 12,000 horas. 
    TecnologÍa 3LCD que brinda imágenes claras, brillantes y llenas de color. Su luminosidad de 4000 lumenes en color y 4000 en color lo convierten en la mejor opción para aulas de educación bien iluminadas. Adicional ofrece una conectividad inalámbrica opcional la cual te permite poder proyectar tu contenido sin requerir cables. 2 puertos HDMI para conectar todos los dispositivos actuales del Aula`,
  },
  {
    id: "119W",
    model: "H985A",
    name: "Proyector Epson 119W",
    units: 1,
    description: "Buena proyección, detalles estéticos",
    price: 1100,
    mainImage: "/images/119W/119w.jpg",
    media: [
      { type: "image", src: "/images/119W/2.jpg" },
      { type: "video", src: "/videos/119W.mp4" },
      { type: "image", src: "/images/119W/3.jpg" },
      { type: "image", src: "/images/119W/4.jpg" },
      { type: "image", src: "/images/119W/5.jpg" },
    ],
    condition: "Exhibición",
    imageBrightness: "4000 lúmenes",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "16.000:1",
    connectivity: "USB, VGA/SVGA D-Sub, HDMI Micro, HDMI",
    features:
      "Proyección de techo, Reproductor de DVD integrado, Portátil, Pantalla integrada, HD Ready, Reproductor de Blu-ray integrado, Altavoces integrados, Enfoque automático, Corrección de color",
    nativeResolution: "1.280 x 800",
    aspectRatio: "16:10",
    throwRatio: "Proyección media/estándar",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `PowerLite 119W es la mejor herramienta de proyección para los salones actuales. Ofrece una resolución WXGA (1.280 x 800 pixeles), con calidad de alta definición. 
    La tecnología 3LCD ofrece imágenes claras, brillantes y llenas de color. Su luminosidad es de 4.000 lúmenes en blanco2 y 4.000 lúmenes en color2 lo convierten en la mejor opción para aulas de educación bien iluminadas.  Adicionalmente, ofrecen conectividad inalámbrica opcional que permite proyectar contenido sin requerir cables.  Cuenta con puertos HDMI para conectar todos los dispositivos actuales del aula educativa.`,
  },
  {
    id: "108",
    model: "H860A",
    name: "Proyector Epson 108",
    units: 4,
    price: 800,
    sub: "Desde S/ 700 por volumen",
    badge: "Oferta",
    mainImage: "/images/108/108.jpg",
    media: [
      { type: "image", src: "/images/108/2.jpg" },
      { type: "video", src: "/videos/108.mp4" },
      { type: "image", src: "/images/108/3.jpg" },
      { type: "image", src: "/images/108/4.jpg" },
      { type: "image", src: "/images/108/5.jpg" },
    ],
    condition: "Exhibición",
    imageBrightness: "3700 lúmenes ANSI",
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "15000:1",
    connectivity: "HDMI estándar, VGA/SVGA D-Sub",
    features:
      "Altavoces incorporados, proyección en el techo, proyección sobre la mesa",
    nativeResolution: "1024 x 768",
    aspectRatio: "4:3",
    throwRatio: "Proyección media/estándar",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `La tecnología 3LCD ofrece imágenes claras, brillantes y llenas de color. Su luminosidad de 3.700 lúmenes en color2y en blanco2 en el PowerLite® 108`,
  },
];

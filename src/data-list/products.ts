import { ReactNode } from "react";

export interface Product {
  id: string;
  model: string;
  name?: string;
  oldStock?: number;
  units: number;
  description?: string;
  price: string;
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
    model: "H688A",
    name: "Proyector Epson 98H",
    oldStock: 12,
    units: 4,
    price: "800",
    sub: "Desde S/ 700 por volumen",
    badge: "Oferta",
    mainImage: "/images/98H/98h.jpg",
    media: [
      { type: "image", src: "/images/980W/2.png" },
      { type: "image", src: "/images/980W/3.png" },
      { type: "image", src: "/images/980W/4.png" },
      { type: "image", src: "/images/980W/5.png" },
      { type: "video", src: "/videos/bg-video-epson.mp4" },
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
    note: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis deleniti nisi totam! A, accusamus assumenda, at blanditiis enim, error et ipsa ipsum itaque minima nam neque numquam quod reprehenderit veniam?
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis deleniti nisi totam! A, accusamus assumenda, at blanditiis enim, error et ipsa ipsum itaque minima nam neque numquam quod reprehenderit veniam.
  
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis deleniti nisi totam! A, accusamus assumenda, at blanditiis enim, error et ipsa ipsum itaque minima nam neque numquam quod reprehenderit veniam.
  
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis deleniti nisi totam! A, accusamus assumenda, at blanditiis enim, error et ipsa ipsum itaque minima nam neque numquam quod reprehenderit veniam,
  lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis deleniti nisi totam! A, accusamus assumenda, at blanditiis enim, error et ipsa ipsum itaque minima nam neque numquam quod reprehenderit veniam
  `,
  },
  {
    id: "980W",
    model: "980W",
    name: "Proyector Epson 98H",
    units: 5,
    description: "Buena proyección, detalles estéticos",
    price: "S/ 1,100 c/u",
    badge: "Top venta",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
  {
    id: "975W",
    model: "975W",
    name: "Proyector Epson 98H",
    units: 3,
    description: "Buena proyección, detalles estéticos",
    price: "S/ 1,100 c/u",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
  {
    id: "1925W",
    model: "1925W",
    name: "Proyector Epson 98H",
    units: 1,
    description: "Buena proyección, detalles estéticos",
    price: "S/ 1,200",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
  {
    id: "970",
    model: "970",
    name: "Proyector Epson 98H",
    units: 1,
    description: "Bajo brillo, detalles estéticos",
    price: "S/ 850",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
  {
    id: "119W",
    model: "119W",
    name: "Proyector Epson 98H",
    units: 1,
    description: "Buena proyección, detalles estéticos",
    price: "S/ 1,100",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
  {
    id: "108",
    model: "108",
    name: "Proyector Epson 98H",
    units: 4,
    description: "Buena proyección, detalles estéticos",
    price: "S/ 1,100 c/u",
    mainImage: "/images/98h.jpg",
    media: [
      { type: "image", src: "/images/98h.png" },
      { type: "video", src: "/bg-video-epson.mp4" },
      { type: "image", src: "/images/98h.png" },
      { type: "image", src: "/images/98h.png" },
    ],
  },
];

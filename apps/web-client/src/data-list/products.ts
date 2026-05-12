import { orderBy } from "lodash";

export type Classification =
  | "premium"
  | "standard"
  | "budget"
  | "clearance"
  | "wholesale";

export type ProductCondition = "gama-alta" | "new" | "reconditioned";

export interface Product extends Price {
  id: string;
  model: string;
  name?: string;
  SN?: string;
  oldStock?: number;
  stock: number;
  description?: string;
  sub?: string;
  badge?: string;
  mainImage?: string;
  media: MediaItem[];
  condition: ProductCondition;
  displayTechnology?: string;
  lumensANSI?: number;
  brand?: string;
  type?: string;
  contrastRatio?: string;
  connectivity?: string;
  features?: string;
  nativeResolution?: string;
  aspectRatio?: string;
  throwRatio?: string;
  category?: string[];
  note?: string;
  campaign?: string;
  classification?: Classification;
  technicalSheetUrl?: string;
  technicalSheetUrlForDownload?: string;
  gama?: "baja" | "media" | "alta" | "muy alta";
  withIgv?: boolean;
}

interface Price {
  oldPrice?: number;
  price: number;
  discount?: number;
  subTotal?: number;
  IGV?: number;
  totalPayment?: number;
  withIgv?: boolean;
}

export interface MediaItem {
  type: string;
  src: string;
}

const productsData: Product[] = [
  {
    id: "bundle-interactivo",
    model: "Bundle Complete 2025",
    name: "Bundle Interactivo Completo 2025 - Transforma Tu Proyector en Pizarra Digital",
    stock: 4,
    condition: "new",
    description:
      "Transforma cualquier proyector en una experiencia interactiva profesional",
    price: 7490,
    badge: "Bundle",
    mainImage: "/productos/bundle/bundlepack2.png",
    media: [
      { type: "image", src: "/productos/bundle/upside109W.png" },
      { type: "image", src: "/productos/bundle/touch.png" },
      { type: "image", src: "/productos/bundle/adaptador-wifi.png" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 4000,
    brand: "Epson",
    type: "Bundle",
    connectivity: "HDMI, VGA, USB, WiFi",
    features:
      "Touch interactivo 10 puntos, Proyección hasta 120 pulgadas, Conectividad inalámbrica, Android integrado",
    nativeResolution: "WXGA (1280x800)",
    aspectRatio: "16:10",
    category: ["Tecnología", "Proyección", "Interactividad"],
    note: "",
  },
  {
    id: "duo-interactivo",
    model: "Touch y Adaptador Inalámbrico",
    name: "Duo Interactivo - Touch + WiFi para Aulas",
    stock: 4,
    condition: "new",
    description: "Touch Interactivo + Adaptador Inalámbrico en un solo paquete",
    price: 5790,
    badge: "Dúo",
    mainImage: "/productos/bundle/duo-interactivo.png",
    media: [
      { type: "image", src: "/productos/bundle/touch.png" },
      { type: "image", src: "/productos/bundle/adaptador-wifi.png" },
    ],
    brand: "iubizon",
    type: "Accesorios",
    connectivity: "USB, WiFi",
    features:
      "10 puntos táctiles, WiFi integrado, Android OS, Multi-usuario, Streaming inalámbrico",
    category: ["Tecnología", "Interactividad", "Conectividad", "Accesorios"],
    note: "",
  },
  {
    id: "ELPAP07",
    model: "V12H418P12",
    name: "Adaptador WiFi Epson ELPAP07",
    stock: 10,
    oldStock: 20,
    condition: "new",
    description: "Accesorio de proyección",
    price: 190.0,
    badge: "Nuevo",
    mainImage: "/productos/ELPAP07/Elpap07-1.jpg",
    media: [
      { type: "image", src: "/productos/ELPAP07/Elpap07-2.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-3.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-4.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-5.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-6.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-7.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-8.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-9.jpg" },
      { type: "image", src: "/productos/ELPAP07/Elpap07-10.jpg" },
    ],
    connectivity: "Wireless/ USB type A/ 802.11 b/g/n",
    brand: "Epson",
    type: "Adaptador",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Accesorios para Proyectores",
    ],
    note: `
      Este adaptador de red inalámbrica de alta velocidad se conecta directamente a ciertos proyectores Epson que permiten un acceso rápido y fácil a la red LAN o redes peer-to-peer y sin cables. Cuando se utiliza con Epson EasyMP Monitor y el software Network Projection, los usuarios pueden acceder de forma remota y controlar los proyectores sobre la red Wi-Fi.
      Compatible con los siguientes proyectores:
        Home Entertainment ProjectorsHome Cinema 3000 2D/3D Full HD 1080p 3LCD Projector

      Proyectores multimedia:
      BrightLink 425Wi Interactive WXGA 3LCD Projector with Wall Mount
      BrightLink 430i Interactive XGA 3LCD Projector with Wall Mount
      BrightLink 435Wi Interactive WXGA 3LCD Projector with Wall Mount
      BrightLink 436Wi Interactive WXGA 3LCD Projector
      BrightLink 475Wi Interactive WXGA 3LCD Projector – Refurbished
      BrightLink 475Wi Interactive WXGA 3LCD Projector with Mount
      BrightLink 480i Interactive XGA 3LCD Projector – Refurbished
      BrightLink 480i Interactive XGA 3LCD Projector with Mount
      BrightLink 485Wi Interactive WXGA 3LCD Projector – Refurbished
      BrightLink 485Wi Interactive WXGA 3LCD Projector with Mount
      BrightLink 575Wi Interactive WXGA 3LCD Projector
      BrightLink 585Wi Interactive WXGA 3LCD Projector
      BrightLink 595Wi Interactive WXGA 3LCD Projector
      BrightLink Pro 1410Wi Meeting Room Productivity Tool with Wall Mount
      BrightLink® Pro 1420Wi Collaborative Whiteboarding Solution
      BrightLink® Pro 1430Wi Collaborative Whiteboarding Solution with Touch
      EX3220 SVGA 3LCD Projector
      EX5220 Wireless XGA 3LCD Projector
      EX5230 Pro XGA 3LCD Projector
      EX6220 WXGA 3LCD Projector
      EX7220 Wireless WXGA 3LCD Projector
      EX7230 Pro HD WXGA 3LCD Projector
      EX7235 Pro Wireless HD WXGA 3LCD Projector
      PowerLite 1222 Wireless XGA 3LCD Projector
      PowerLite 1262W Wireless WXGA 3LCD Projector
      PowerLite 1263W Wireless HD WXGA 3LCD Projector
      PowerLite 1760W Multimedia Projector
      PowerLite 1761W WXGA 3LCD Projector
      PowerLite 1770W Multimedia Projector
      PowerLite 1771W WXGA 3LCD Projector
      PowerLite 1775W Multimedia Projector
      PowerLite 1776W WXGA 3LCD Projector
      PowerLite 1835 XGA 3LCD Projector
      PowerLite 1945W WXGA 3LCD Projector
      PowerLite 1955 XGA 3LCD Projector
      PowerLite 1965 XGA 3LCD Projector
      PowerLite 1975W WXGA Wireless 3LCD Multimedia Projector
      PowerLite 1985WU WUXGA Wireless 3LCD Projector
      PowerLite 420 XGA 3LCD Projector
      PowerLite 425W WXGA 3LCD Projector
      PowerLite 430 XGA 3LCD Projector
      PowerLite 435W WXGA 3LCD Projector
      PowerLite 4650 XGA 3LCD Projector
      PowerLite 470 XGA 3LCD Projector
      PowerLite 4750W WXGA 3LCD Projector
      PowerLite 475W WXGA 3LCD Projector
      PowerLite 480 XGA 3LCD Projector
      PowerLite 4855WU WUXGA 3LCD Projector
      PowerLite 485W WXGA 3LCD Projector
      PowerLite 520 XGA 3LCD Projector
      PowerLite 525W WXGA 3LCD Projector
      PowerLite 530 XGA 3LCD Projector
      PowerLite 530 XGA 3LCD Projector for SMART
      PowerLite 535W WXGA 3LCD Projector
      PowerLite 570 XGA 3LCD Projector
      PowerLite 575W WXGA 3LCD Projector
      PowerLite 580 XGA 3LCD Projector
      PowerLite 580 XGA 3LCD Projector for SMART
      PowerLite 585W WXGA 3LCD Projector
      PowerLite 585W WXGA 3LCD Projector for SMART
      PowerLite 905 XGA 3LCD Projector
      PowerLite 915W WXGA 3LCD Projector
      PowerLite 935W WXGA 3LCD Projector
      PowerLite 95 XGA 3LCD Projector
      PowerLite 955W WXGA 3LCD Projector
      PowerLite 955WH WXGA 3LCD Projector
      PowerLite 965 XGA 3LCD Projector
      PowerLite 965H XGA 3LCD Projector
      PowerLite 96W WXGA 3LCD Projector
      PowerLite 97 XGA 3LCD Projector
      PowerLite 97H XGA 3LCD Projector
      PowerLite 98 XGA 3LCD Projector
      PowerLite 98H XGA 3LCD Projector
      PowerLite 99W WXGA 3LCD Projector
      PowerLite 99WH WXGA 3LCD Projector
      PowerLite D6150 XGA 3LCD Projector
      PowerLite D6155W WXGA 3LCD Projector
      PowerLite D6250 XGA 3LCD Projector
      PowerLite Pro G6050W WXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6050WNL WXGA 3LCD Projector without Lens
      PowerLite Pro G6070W WXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6150NL XGA 3LCD Projector without Lens
      PowerLite Pro G6170 XGA 3LCD Projector with Standard Lens
      PowerLite Pro G6270W WXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6450WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6450WUNL WUXGA 3LCD Projector without Lens
      PowerLite Pro G6470WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6550WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6550WUNL WUXGA 3LCD Projector without Lens
      PowerLite Pro G6570WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6750WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro G6750WUNL WUXGA 3LCD Projector without Lens
      PowerLite Pro G6770WU WUXGA 3LCD Projector with Standard Lens
      PowerLite Pro Z8150NL XGA 3LCD Projector
      PowerLite Pro Z8250NL XGA 3LCD Projector
      PowerLite Pro Z8255NL XGA 3LCD Projector
      PowerLite Pro Z8350WNL WXGA 3LCD Projector without Lens
      PowerLite Pro Z8450WUNL WUXGA 3LCD Projector
      PowerLite Pro Z8455WUNL WUXGA 3LCD Projector
      PowerLite S17 SVGA 3LCD Projector
      PowerLite S27 SVGA 3LCD Projector
      PowerLite W17 WXGA 3LCD Projector
      PowerLite W29 WXGA 3LCD Projector
      PowerLite X17 XGA 3LCD Projector
      PowerLite X27 XGA 3LCD Projector
    `,
  },
  {
    id: "ELPAP10",
    model: "V12H731P02",
    name: "Adaptador Epson ELPAP10 Módulo Inalámbrico WiFi",
    stock: 16,
    oldStock: 20,
    condition: "new",
    description: "Accesorio de proyección",
    price: 350.0,
    badge: "Nuevo",
    mainImage: "/productos/ELPAP10/Elpap10-1.jpg",
    media: [
      { type: "image", src: "/productos/ELPAP10/Elpap10-2.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-3.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-4.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-5.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-6.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-7.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-8.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-9.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-10.jpg" },
      { type: "image", src: "/productos/ELPAP10/Elpap10-11.jpg" },
    ],
    connectivity: "Wireless/ USB type A/ 802.11 b/g/n",
    brand: "Epson",
    type: "Adaptador",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Accesorios para Proyectores",
    ],
    note: `Este adaptador de red inalámbrico de alta velocidad se conecta directamente a ciertos proyectores Epson, lo que permite un acceso rápido y fácil a la LAN o redes punto a punto sin cables. Cuando se utilizan con el software Epson EasyMP Monitor y Network Projection, los usuarios pueden acceder de forma remota y controlar proyectores a través de la LAN inalámbrica.
     
      Compatible con los siguientes proyectores:
          Proyector Láser Epson LS100 Full HD 3LCD
          Proyector Epson Home Cinema 760HD
          Proyectores Portátiles Para El Trabajo
          Proyector Epson PowerLite W05+
          Proyector Epson PowerLite S41+
          Proyector Epson PowerLite X05+
          Proyector Epson PowerLite X41+
          Proyector Epson VS250 SVGA 3LCD
          Proyector PowerLite 1771W WXGA 3LCD
          Proyector Epson PowerLite 2042 XGA 3LCD
          Proyector Epson PowerLite 2142W WXGA 3LCD
          Proyector Inalámbrico PowerLite 2247U Full HD WUXGA 3LCD
          Proyector Láser Epson PowerLite L400U WUXGA 3LCD
          Proyector Láser Epson PowerLite L500W WXGA 3LCD
          Proyector Láser Epson PowerLite L610 XGA 3LCD
          Proyector Láser Epson PowerLite L510U WUXGA 3LCD
          Proyector Láser Epson PowerLite L610W WXGA 3LCD
          Proyector Epson PowerLite 5535U WUXGA 3LCD
          Proyector Epson PowerLite 5520W WXGA 3LCD
          Proyector Epson PowerLite 5510 XGA 3LCD
          Proyector Epson PowerLite 2040 XGA 3LCD
          Proyector Epson PowerLite 2140W WXGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2065 XGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2155W WXGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2165W WXGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2250U Full HD WUXGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2255U Full HD WUXGA 3LCD
          Proyector Inalámbrico Epson PowerLite 2265U Full HD WUXGA 3LCD
          Proyector Inalámbrico PowerLite 2245U Full HD WUXGA 3LCD
          Proyector Epson PowerLite S31+
          Proyector PowerLite W32+
          Proyector PowerLite 1985WU WUXGA Wireless 3LCD
          Proyector Epson Powerlite Pro G7500U c/ 4K Enhancement y Lente Estándar
          Proyector Epson PowerLite Pro G7000W c/ lente estándar
          Proyector Epson PowerLite Pro G7100 c/ Lente estándar
          Proyector Epson PowerLite Pro G7200W c/ Lente estándar
          Proyector Epson PowerLite Pro G7805 XGA 3LCD con lente estándar
          Proyector Epson PowerLite Pro G7905U c/ 4K Enhancement y Lente Estándar
          Proyector Epson Pro L1100U Láser c/ 4K Enhancement y Lente Estándar
          Proyector Epson Pro L1200U c/ 4K Enhancement y Lente Estándar
          Proyector Epson Pro L1505U Láser c/4K Enhancement y Lente Estándar
          Proyector PowerLite Pro G7400U c/ 4K Enhancement y Lente Estándar
          Proyector Pro L1405U Láser c/4K Enhancement y Lente Estándar
          Proyector Láser Interactivo Epson BrightLink 710Ui WUXGA 3LCD
          Proyector Láser Interactivo Epson BrightLink Pro 1470Ui WUXGA 3LCD
          Proyector Interactivo Epson BrightLink Pro 1450Ui Full HD
          Proyector Interactivo Epson BrightLink Pro 1460Ui Full HD
          Proyector Interactivo Epson BrightLink 675Wi+
          Proyector Interactivo Epson BrightLink 685Wi+
          Proyector Interactivo Epson BrightLink 695Wi+
    `,
  },
  {
    id: "ELPAP11",
    model: "V12H005A02",
    name: "Adaptador Epson ELPAP11 Modulo Inalámbrico WiFi",
    stock: 17,
    oldStock: 20,
    condition: "new",
    description: "Accesorio de proyección",
    price: 490.0,
    badge: "Nuevo",
    mainImage: "/productos/ELPAP11/Elpap11-1.jpg",
    media: [
      { type: "image", src: "/productos/ELPAP11/Elpap11-2.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-3.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-4.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-5.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-6.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-7.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-8.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-9.jpg" },
      { type: "image", src: "/productos/ELPAP11/Elpap11-10.jpg" },
    ],
    connectivity: "Wireless/ USB type A/ 802.11 b/g/n",
    brand: "Epson",
    type: "Adaptador",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Accesorios para Proyectores",
    ],
    note: `Epson ELPAP11 Modulo Inalambrico es un modulo inalambrico de alta velocidad se conecta directamente a proyectores Epson seleccionados, lo que permite un acceso rápido y fácil a la LAN o redes de igual a igual sin cables.

    Cuando se utiliza con el software Epson Projector Management o iProjection, los usuarios pueden acceder y controlar los proyectores de forma remota a través de la LAN inalámbrica.
    
    Carasteristicas:
      Alineado con los estándares 802.11 b / g / n
      Utiliza conector USB tipo A
      Compatible con PC o Mac
      Capaz de transmitir audio
    
    
    Compatible con proyectores Epson: 
    
    Proyectores de cine en casa:
      Proyector Home Cinema 880 3LCD 1080p
    
    Proyectores portátiles para el trabajo:
      Proyector láser inalámbrico Pro EX11000 3LCD Full HD 1080p
    
    Proyectores para salas de reuniones para el trabajo:
      Proyector láser PowerLite L770U 3LCD con mejora 4K
      Proyector láser PowerLite L775U 3LCD con mejora 4K
      Proyector láser PowerLite L570U 3LCD con mejora 4K
      Proyector láser PowerLite L630U Full HD WUXGA 3LCD
      Proyector láser PowerLite L730U Full HD WUXGA 3LCD
      Proyector láser de largo alcance PowerLite L520U Full HD WUXGA 3LCD
      Proyector láser PowerLite L520W WXGA 3LCD
      Proyector láser PowerLite L530U Full HD WUXGA 3LCD
    
    Proyectores para grandes espacios:
      EB-PU2116W Proyector láser 3LCD de 16 000 lúmenes con mejora 4K
      EB-PU2120W Proyector láser 3LCD de 20 000 lúmenes con mejora 4K
      EB-PU2216B Proyector láser para espacios grandes 3LCD de 16 000 lúmenes con mejora 4K
      EB-PU2220B Proyector láser para espacios grandes 3LCD de 20 000 lúmenes con mejora 4K
      EB-PU2113W Proyector láser 3LCD de 13 000 lúmenes con mejora 4K
      EB-PU2213B Proyector láser 3LCD de 13 000 lúmenes con mejora 4K
      EB-PU1008B Proyector láser WUXGA 3LCD con mejora 4K
      Proyector láser 3LCD WUXGA EB-PU1008W con mejora 4K
      EB-PU2010B Proyector láser WUXGA 3LCD con mejora 4K
      EB-PU2010W Proyector láser WUXGA 3LCD con mejora 4K
      EB-PU1006W Proyector láser WUXGA 3LCD con mejora 4K
      EB-PU1007B WUXGA 3LCD Laser Projector with 4K Enhancement
      EB-PU1007W WUXGA 3LCD Laser Projector with 4K Enhancement  
    
    Proyectores interactivos y herramientas de colaboración:
      BrightLink 760Wi WXGA 3LCD Pantalla láser interactiva sin lámpara
      BrightLink 770Fi 1080p 3LCD Pantalla láser sin lámpara interactiva de alcance ultracorto
      Pantalla láser interactiva BrightLink 725Wi WXGA 3LCD
      Pantalla láser interactiva BrightLink 735Fi 1080p 3LCD
      Pantalla láser interactiva BrightLink 1480Fi 1080p 3LCD
      Pantalla láser interactiva BrightLink 1485Fi 1080p 3LCD
    
    Proyectores de aula:
      Pantalla láser sin lámpara PowerLite 810E 3LCD de tiro corto extremo con mejora 4K
      Pantalla láser sin lámpara PowerLite L210W WXGA 3LCD con conexión inalámbrica integrada
      Pantalla láser PowerLite L260F 1080p 3LCD sin lámpara con conexión inalámbrica integrada
      Pantalla láser PowerLite L265F 1080p 3LCD sin lámpara con conexión inalámbrica integrada
      Pantalla láser sin lámpara PowerLite 775F 1080p 3LCD de alcance ultracorto
      PowerLite L210SF Wireless 1080p 3LCD Pantalla láser sin lámpara de tiro corto
      PowerLite L210SW Wireless WXGA 3LCD Pantalla láser sin lámpara de tiro corto
      Pantalla láser sin lámpara PowerLite de 760 W inalámbrica WXGA 3LCD de alcance ultracorto
      Pantalla láser sin lámpara PowerLite 770F 1080p 3LCD de alcance ultracorto
      PowerLite L255F 1080p 3LCD Standard-Throw Laser Projector with Built-in Wireless
      PowerLite L250F 1080p 3LCD Standard-Throw Laser Projector with Built-in Wireless
      PowerLite L200X 3LCD XGA Laser Projector with Built-in Wireless
      PowerLite L200W 3LCD WXGA Laser Projector with Built-in Wireless
      PowerLite L200SW Wireless WXGA 3LCD Short-throw Laser Display
      PowerLite L200SX Wireless XGA 3LCD Short-throw Laser Display
      PowerLite 725W WXGA 3LCD Ultra Short-throw Laser Display
      PowerLite 720 XGA 3LCD Ultra Short-throw Laser Display
      PowerLite 750F Full HD 1080p Ultra Short-throw Laser Projector with Built-in Wireless
      PowerLite 755F Full HD 1080p Ultra Short-throw Laser Projector for Digital Signage with Built-in Wireless
      PowerLite 800F Full HD 1080p Ultra Short-throw Laser Projector for Classrooms
      PowerLite 118 3LCD XGA Classroom Projector with Dual HDMI
      Proyector de aula PowerLite 119W 3LCD WXGA con HDMI doble
      Proyector de aula PowerLite 982W 3LCD WXGA con HDMI doble
      Proyector de aula PowerLite W49 3LCD WXGA con HDMI
      Proyector de aula PowerLite X49 3LCD XGA con HDMI
    
    Señalización digital:
      Proyector láser de corto alcance PowerLite L630SU Full HD WUXGA
      Proyector láser de corto alcance PowerLite L635SU Full HD WUXGA
      Proyector láser PowerLite L735U Full HD WUXGA 3LCD
      Proyector láser de alcance ultracorto PowerLite 805F Full HD 1080p para señalización digital
`,
  },
  {
    id: "Proyector-Led-Portatil-HY350-Magcubic-Full-Hd-1080p-Android",
    model: "HY350",
    name: "Proyector Magcubic HY350 Android TV - Full HD 1080p Portatil",
    stock: 4,
    oldStock: 20,
    condition: "new",
    description: "",
    price: 390,
    badge: "Nuevo",
    mainImage: "/productos/HY350/Magic.jpg",
    media: [
      { type: "image", src: "/productos/HY350/Magic-1.jpg" },
      { type: "image", src: "/productos/HY350/Magic-2.jpg" },
      { type: "image", src: "/productos/HY350/Magic-3.jpg" },
      { type: "image", src: "/productos/HY350/Magic-4.jpg" },
      { type: "image", src: "/productos/HY350/Magic-5.jpg" },
      { type: "image", src: "/productos/HY350/Magic-6.jpg" },
      { type: "image", src: "/productos/HY350/Magic-7.jpg" },
      { type: "image", src: "/productos/HY350/Magic-8.jpg" },
      { type: "image", src: "/productos/HY350/Magic-9.jpg" },
      { type: "video", src: "/productos/HY350/outboxing.mp4" },
      { type: "image", src: "/productos/HY350/Magic-10.jpg" },
      { type: "image", src: "/productos/HY350/Magic-11.jpg" },
      { type: "image", src: "/productos/HY350/Magic-12.jpg" },
      { type: "image", src: "/productos/HY350/Magic-13.jpg" },
      { type: "image", src: "/productos/HY350/Magic-14.jpg" },
      { type: "image", src: "/productos/HY350/Magic-15.jpg" },
      { type: "image", src: "/productos/HY350/Magic-16.jpg" },
      { type: "image", src: "/productos/HY350/Magic-17.jpg" },
      { type: "image", src: "/productos/HY350/Magic-18.jpg" },
      { type: "image", src: "/productos/HY350/Magic-19.jpg" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 580,
    brand: "MagCubic",
    type: "Proyector",
    connectivity: "USB, HDMI Estándar, Wi-Fi 6 y Bluetooth 5.0.",
    features: "Altavoces integrados",
    nativeResolution: "Full HD 1080p con soporte para 4K",
    throwRatio: "Proyección baja/media",
    category: [
      "Electrónica",
      "TV, Video y Audio para el Hogar",
      "TV y Video",
      "Proyectores para Home Theater",
    ],
    note: `
        - Sistema Operativo: Android 11.0
        - Procesador (CPU Allwinner H713 ARM Cortex-A53 de cuatro núcleos
        - Procesador Gráfico (GPU): Mali-G31 compatible con OpenGL ES 3.2 y OpenCL 2.0
        - Memoria RAM/ROM: 2 GB + 32 GB
        
        Características del Producto:
        
        Actualización a Proyector Inteligente con Android TV 11.0
        Este proyector inteligente cuenta con un sistema operativo Android integrado que soporta WiFi 6 de doble banda (5.8G/2.4G) y Bluetooth 5.0. Estas características permiten una carga de video más rápida y una transmisión de contenido más fluida, mejorando la experiencia de visualización. Además, incluye altavoces estéreo con sonido envolvente 360°, creando un ambiente de cine en casa.
        
        Resolución Nativa 1080P y Compatible con Proyección 4K
        Con un brillo ANSI de 580 lúmenes y una resolución nativa de 1920x1080P, este proyector ofrece imágenes nítidas, claras y vibrantes. Además, es compatible con la reproducción de contenido 4K, brindando una experiencia visual de alta definición. El tamaño de proyección de hasta 150" permite disfrutar de una pantalla gigante y de calidad cinematográfica.
        
        Enfoque Eléctrico y Corrección Trapezoidal Automática
        Este proyector facilita el ajuste de la imagen gracias a su enfoque eléctrico, que se controla fácilmente con un solo botón en el control remoto. También incluye corrección trapezoidal automática, corrección 4P y zoom ajustable del 50% al 100%. Además, opera con un nivel de ruido inferior a 35 dB, lo que lo convierte en la opción ideal para disfrutar de una proyección silenciosa y cómoda.
        
        Nota Al emparejar el proyector con el control remoto a través de Bluetooth, podrás utilizar la función de control por voz.
    `,
  },
  {
    id: "Cable-hdmi",
    model: "HY350",
    name: "Cable Hdmi de 1.5mts Luxshare-ICT",
    stock: 50,
    oldStock: 60,
    condition: "new",
    description: "",
    price: 20,
    badge: "Nuevo",
    mainImage: "/productos/Cable-hdmi/Cable-hdmi.jpg",
    media: [
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-2.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-3.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-4.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-5.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-6.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-7.jpg" },
      { type: "image", src: "/productos/Cable-hdmi/Cable-hdmi-8.jpg" },
    ],
    brand: "Luxshare-ICT",
    type: "Accesorio",
    connectivity: "HDMI Estándar",
    note: `
        - Tipo de Cable: HDMI de alta velocidad
        - Versión: HDMI 2.0 (compatible con versiones anteriores)
        - Longitud: 1.5 metros
        - Resolución Soportada: Hasta 4K Ultra HD (3840 x 2160)
        - Material del Conductor: Cobre de alta pureza
        - Conectores: HDMI macho a HDMI macho
        - Compatibilidad: TV, monitores, proyectores, consolas, laptops
        
        Características del Producto:
        
        Transmisión de Video y Audio en Alta Definición
        Este cable HDMI permite la transmisión simultánea de video y audio digital en alta calidad, soportando resoluciones de hasta 4K Ultra HD. Ideal para disfrutar contenido con excelente nitidez, colores vibrantes y sonido envolvente sin pérdidas.
        
        Conectividad Estable y de Alto Rendimiento
        Gracias a su construcción con materiales de alta calidad, el cable ofrece una señal estable y sin interferencias. Es perfecto para uso continuo en equipos como televisores, proyectores, consolas de videojuegos y reproductores multimedia.

        Diseño Resistente y Duradero
        El cable cuenta con conectores reforzados y recubrimiento resistente que protege contra el desgaste, dobleces y uso frecuente. Su diseño garantiza una larga vida útil incluso en entornos exigentes.
        
        Compatibilidad Universal
        Es compatible con una amplia gama de dispositivos con puerto HDMI, incluyendo Smart TV, laptops, PC, consolas como PlayStation y Xbox, reproductores Blu-ray y proyectores, facilitando una conexión rápida y sencilla.
        
        Nota: Para obtener el mejor rendimiento, se recomienda conectar correctamente ambos extremos del cable y evitar dobleces extremos que puedan afectar la transmisión de señal.    `,
  },
  {
    id: "Cable-poder",
    model: "",
    name: "Cable de poder para proyector",
    stock: 50,
    oldStock: 60,
    condition: "new",
    description: "",
    price: 25,
    badge: "Nuevo",
    mainImage: "/productos/Cable-poder/Cable-poder.jpg",
    media: [
      { type: "image", src: "/productos/Cable-poder/Cable-poder-2.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-3.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-4.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-5.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-6.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-7.jpg" },
      { type: "image", src: "/productos/Cable-poder/Cable-poder-8.jpg" },
    ],
    brand: "Standar",
    type: "Accesorio",
    connectivity: "Cable de poder Estándar",
    note: `
        - Tipo de Cable: Cable de poder AC para proyector
        - Tipo de Conector: IEC C13 a enchufe estándar (según región)
        - Longitud: 1.5 metros 
        - Voltaje Soportado: 110V – 250V
        - Corriente Máxima: 10A
        - Material del Conductor: Cobre de alta calidad
        - Compatibilidad: Proyectores, monitores, CPU, impresoras
        
        Características del Producto:
        
        Suministro de Energía Seguro y Estable
        Este cable de poder está diseñado para proporcionar una conexión eléctrica confiable y estable a proyectores y otros equipos electrónicos. Garantiza un flujo de energía continuo, evitando interrupciones durante el uso.
        
        Alta Compatibilidad con Equipos Electrónicos
        Gracias a su conector estándar IEC C13, este cable es ampliamente compatible con proyectores de diversas marcas, así como con computadoras de escritorio, monitores e impresoras, facilitando su uso en diferentes entornos.
        
        Diseño Resistente y Duradero
        Fabricado con materiales de alta calidad, el cable cuenta con un recubrimiento resistente que protege contra el desgaste, el calor y el uso constante. Su estructura robusta asegura una larga vida útil.
        
        Instalación Fácil y Uso Práctico
        Su diseño permite una conexión rápida y segura sin necesidad de herramientas. Ideal para uso en oficinas, hogares, salas de reuniones o entornos educativos.
        
        Nota: Asegúrese de verificar la compatibilidad del conector con su equipo antes de usarlo y evite el uso en condiciones de humedad o con cables dañados para garantizar la seguridad.    `,
  },
  {
    id: "Cable-vga",
    model: "",
    name: "Cable vga de 1.5mts",
    stock: 50,
    oldStock: 60,
    condition: "new",
    description: "",
    price: 16,
    badge: "Nuevo",
    mainImage: "/productos/Cable-vga/Cable-vga.jpg",
    media: [
      { type: "image", src: "/productos/Cable-vga/Cable-vga-2.jpg" },
      { type: "image", src: "/productos/Cable-vga/Cable-vga-3.jpg" },
      { type: "image", src: "/productos/Cable-vga/Cable-vga-4.jpg" },
      { type: "image", src: "/productos/Cable-vga/Cable-vga-5.jpg" },
      { type: "image", src: "/productos/Cable-vga/Cable-vga-6.jpg" },
    ],
    brand: "Cable vga",
    type: "Accesorio",
    connectivity: "VGA Estándar",
    note: `
        - Tipo de Cable: VGA (Video Graphics Array)
        - Tipo de Conector: VGA macho a VGA macho (15 pines)
        - Longitud: 1.5 metros
        - Resolución Soportada: Hasta 1080p Full HD (dependiendo del equipo)
        - Material del Conductor: Cobre de alta calidad
        - Blindaje: Protección contra interferencias electromagnéticas
        - Compatibilidad: Monitores, proyectores, CPU, laptops con puerto VGA
        
        Características del Producto:
        
        Transmisión de Video Clara y Estable
        Este cable VGA permite transmitir señal de video analógica con buena calidad, ideal para presentaciones, oficinas o entornos educativos. Ofrece una imagen estable y continua para proyectores y monitores compatibles.
        
        Conectividad Segura y Sin Interferencias
        Gracias a su sistema de blindaje, el cable reduce interferencias externas, asegurando una mejor calidad de señal. Sus conectores de 15 pines proporcionan una conexión firme y confiable.
        
        Diseño Resistente y de Larga Duración
        Fabricado con materiales duraderos, el cable cuenta con un recubrimiento resistente al uso frecuente, evitando daños por dobleces o manipulación constante.
        
        Amplia Compatibilidad
        Compatible con una gran variedad de dispositivos con puerto VGA, como computadoras de escritorio, laptops, monitores y proyectores, facilitando su integración en diferentes configuraciones.
        
        El cable VGA transmite únicamente señal de video, por lo que se requiere un cable adicional para audio en caso de ser necesario.    `,
  },
  {
    id: "Control-remoto",
    model: "",
    name: "Cable remoto para proyector Epson",
    stock: 50,
    oldStock: 60,
    condition: "new",
    description: "",
    price: 45,
    badge: "Nuevo",
    mainImage: "/productos/Control/control-epson.jpg",
    media: [
      { type: "image", src: "/productos/Control/control-epson-2.jpg" },
      { type: "image", src: "/productos/Control/control-epson-3.jpg" },
      { type: "image", src: "/productos/Control/control-epson-4.jpg" },
      { type: "image", src: "/productos/Control/control-epson-5.jpg" },
    ],
    brand: "Control remoto Epson",
    type: "Accesorio",
    connectivity: "Estandar",
    note: `
        - Tipo de Producto: Control remoto para proyector
        - Marca Compatible: Epson
        - Tipo de Conexión: Infrarrojo (IR)
        - Alcance: Hasta 8–10 metros (aproximadamente)
        - Alimentación: 2 baterías AAA
        - Funciones: Encendido/apagado, navegación de menú, control de imagen, volumen
        - Compatibilidad: Diversos modelos de proyectores Epson
        
        Características del Producto:
        
        Control Total del Proyector a Distancia
        Este control remoto permite manejar todas las funciones principales del proyector Epson de forma cómoda, incluyendo encendido, apagado, navegación por menús, ajuste de imagen y control de volumen.
        
        Conectividad Segura y Sin Interferencias
        Gracias a su sistema de blindaje, el cable reduce interferencias externas, asegurando una mejor calidad de señal. Sus conectores de 15 pines proporcionan una conexión firme y confiable.
        
        Diseño Resistente y de Larga Duración
        Fabricado con materiales duraderos, el cable cuenta con un recubrimiento resistente al uso frecuente, evitando daños por dobleces o manipulación constante.
        
        Amplia Compatibilidad
        Compatible con una gran variedad de dispositivos con puerto VGA, como computadoras de escritorio, laptops, monitores y proyectores, facilitando su integración en diferentes configuraciones.
        
        El cable VGA transmite únicamente señal de video, por lo que se requiere un cable adicional para audio en caso de ser necesario.    `,
  },
  {
    id: "Filtro",
    model: "",
    name: "Filtro para proyector Epson",
    stock: 4,
    oldStock: 20,
    condition: "new",
    description: "",
    price: 40,
    badge: "Nuevo",
    withIgv: true,
    mainImage: "/productos/Filtro/Filtro.jpg",
    media: [
      { type: "image", src: "/productos/Filtro/Filtro-2.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-3.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-4.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-5.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-6.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-7.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-8.jpg" },
      { type: "image", src: "/productos/Filtro/Filtro-9.jpg" },
    ],
    brand: "Filtro para Epson",
    type: "Accesorio",
    connectivity: "Estandar",
    note: `
        - Tipo de Producto: Filtro de aire para proyector
        - Función: Protección contra polvo y partículas
        - Material: Espuma/fibra filtrante de alta eficiencia
        - Compatibilidad: Proyectores  Epson 
        - Instalación: Fácil, sin herramientas 
        - Ubicación: Compartimiento lateral o inferior del proyector
        
        Características del Producto:
        
        Protección del Sistema Interno del Proyector
        Este filtro de aire evita que el polvo y otras partículas ingresen al interior del proyector, protegiendo componentes clave como la lente, el sistema óptico y los ventiladores.
        
        Mejora del Rendimiento y Vida Útil
        Al mantener limpio el sistema interno, el filtro ayuda a prevenir el sobrecalentamiento y asegura un funcionamiento óptimo del equipo, prolongando su vida útil.
        
        Fácil Mantenimiento y Limpieza
        El filtro puede retirarse fácilmente para su limpieza periódica, lo que permite mantener el proyector en buenas condiciones sin necesidad de mantenimiento técnico frecuente.
        
        Diseño Práctico y Compatible
        Está diseñado para adaptarse a distintos modelos de proyectores, facilitando su reemplazo cuando el filtro original se encuentra desgastado o saturado.
        
        Se recomienda limpiar o reemplazar el filtro regularmente según el uso del proyector para evitar acumulación de polvo y garantizar un rendimiento adecuado.  },
    `,
  },
  // Producto 97H Open Box - Tiro Largo
  {
    id: "97H-open-box",
    model: "97H-OpenBox",
    name: "Proyector Epson 97H - Tiro Largo 2700 Lumens",
    stock: 3,
    condition: "new",
    description:
      "Proyector de tiro largo con 2700 lumens, ideal para aulas y salas de reuniones medianas",
    price: 1200,
    badge: "Open Box",
    mainImage: "/productos/97H-open-box/1.jpg",
    media: [
      { type: "image", src: "/productos/97H-open-box/1.jpg" },
      { type: "image", src: "/productos/97H-open-box/2.jpg" },
      { type: "image", src: "/productos/97H-open-box/3.jpg" },
      { type: "image", src: "/productos/97H-open-box/4.jpg" },
      { type: "image", src: "/productos/97H-open-box/5.jpg" },
      { type: "image", src: "/productos/97H-open-box/6.jpg" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 2700,
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "3000:1",
    connectivity: "HDMI, VGA, USB, Audio",
    features: "Tiro largo, Alta luminosidad, Bajo consumo",
    nativeResolution: "XGA (1024x768)",
    aspectRatio: "4:3",
    throwRatio: "Tiro largo (1.5 - 2.0)",
    category: ["Proyector", "Tiro Largo", "2700 lumens"],
    note: `🔥 Pantalla gigante en cualquier espacio

¿Necesitas proyectar en grande desde lejos y con buena calidad?

Este proyector de tiro largo Epson 97H es ideal para lograr una imagen potente y clara en aulas, salas o negocios 🔥

💰 Llévatelo hoy por solo S/ 1,200

✅ Imagen grande desde mayor distancia
✅ Perfecto para espacios amplios
✅ Ideal para clases, capacitaciones o presentaciones
✅ Incluye caja y accesorios originales (Cable poder, hdmi, control, pilas, manual)
✅ Estado 10/10, OpenBox
✅ Incluye 6 meses de garantía 🔒

💡 Recomendado para:
✔ Salones grandes
✔ Iglesias
✔ Oficinas
✔ Eventos y capacitaciones

Nos encontramos en Chorrillos, Lima

⚡ Stock limitado – 3 unidades

WSP: 9️⃣ 7️⃣ 2️⃣ 3️⃣ 0️⃣ 0️⃣ 3️⃣ 0️⃣ 1️⃣`,
  },
  // Producto 520 Open Box - Tiro Corto
  {
    id: "520-openbox",
    model: "520-OpenBox",
    name: "Proyector Epson 520 - Tiro Corto 2700 Lumens",
    stock: 1,
    condition: "new",
    description:
      "Proyector de tiro corto con 2700 lumens, perfecto para espacios pequeños y pizarras interactivas",
    price: 1200,
    badge: "Open Box",
    mainImage: "/productos/520-openbox/1.jpg",
    media: [
      { type: "image", src: "/productos/520-openbox/1.jpg" },
      { type: "image", src: "/productos/520-openbox/3.jpg" },
      { type: "image", src: "/productos/520-openbox/4.jpg" },
      { type: "image", src: "/productos/520-openbox/5.jpg" },
      { type: "image", src: "/productos/520-openbox/6.jpg" },
      { type: "image", src: "/productos/520-openbox/7.jpg" },
      { type: "image", src: "/productos/520-openbox/8.jpg" },
      { type: "image", src: "/productos/520-openbox/9.jpg" },
      { type: "image", src: "/productos/520-openbox/10.jpg" },
      { type: "image", src: "/productos/520-openbox/11.jpg" },
      { type: "image", src: "/productos/520-openbox/12.jpg" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 2700,
    brand: "Epson",
    type: "Proyector",
    contrastRatio: "3000:1",
    connectivity: "HDMI, VGA, USB, Audio",
    features: "Tiro corto, Ideal para pizarras, Compacto",
    nativeResolution: "XGA (1024x768)",
    aspectRatio: "4:3",
    throwRatio: "Tiro corto (0.5 - 0.7)",
    category: ["Proyector", "Tiro Corto", "2700 lumens"],
    note: `🚀 Convierte cualquier pared en una pantalla gigante profesional

Exclusivo para areas pequeñas, se usa pegado a la pared.

Proyector de tiro corto tipo educativo/profesional por solo S/ 1,200 😱

✅ Imagen grande incluso en espacios pequeños
✅ Ideal para clases, presentaciones o negocios
✅ Ahorra espacio (se instala cerca de la pared)
✅ Incluye caja y accesorios originales (Cable poder, hdmi, control, pilas, manual)
✅ Estado 10/10, OpenBox
✅ Incluye 6 meses de garantía 🔒

💡 Perfecto para:
✔ Colegios
✔ Academias
✔ Oficinas
✔ Emprendedores

Nos encontramos en Chorrillos, Lima

WSP: 9️⃣ 7️⃣ 2️⃣ 3️⃣ 0️⃣ 0️⃣ 3️⃣ 0️⃣ 1️⃣`,
  },
  // Lote 7 Proyectores
  {
    id: "lote-7-proyectores",
    model: "Lote-7-Proyectores",
    name: "Lote 7 Proyectores Epson 3800 Lumens - Precio por Volumen",
    stock: 1,
    condition: "reconditioned",
    description:
      "Lote de 7 proyectores Epson, ideales para aulas y oficinas. Precio especial Llevando 5 unidades a más.",
    price: 900,
    badge: "Lote",
    note: "IGV aparte",
    withIgv: true,
    mainImage: "/productos/lote-7-proyectores/1.jpg",
    media: [
      { type: "image", src: "/productos/lote-7-proyectores/1.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/2.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/3.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/4.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/5.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/6.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/7.jpg" },
      { type: "image", src: "/productos/lote-7-proyectores/8.jpg" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 3800,
    brand: "Epson",
    type: "Lote",
    connectivity: "HDMI, VGA, USB",
    features:
      "Proyectores Epson 3800-4000 lumens, Ideal para aulas y oficinas grandes",
    nativeResolution: "XGA",
    aspectRatio: "4:3",
    category: ["Lote", "Proyectores", "Epson"],
  },
];

// ============================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================

export const IGV_RATE = 0.18;

export const DISCOUNT_RATES = {
  new: 0, // 17% para productos nuevos
  reconditioned: 0, // 42% para reacondicionados
  "gama-alta": 0, // Sin descuento para gama alta
} as const;

const PRODUCTS_WITHOUT_AUTO_DISCOUNT = ["Bundle", "Accesorios"] as const;

// ============================================
// FUNCIONES DE CÁLCULO DE PRECIOS
// ============================================

const calcProductPrices = (
  product: Product,
  percentageDiscount: number = 0,
): Price => {
  const originalPrice = product.price;
  const withIgv = product.withIgv === true;

  if (percentageDiscount === 0) {
    if (withIgv) {
      const subTotal = originalPrice;
      const IGV = +(subTotal * IGV_RATE).toFixed(2);
      const totalPayment = +(subTotal + IGV).toFixed(2);

      return {
        oldPrice: undefined,
        price: originalPrice,
        discount: undefined,
        subTotal,
        IGV,
        totalPayment,
        withIgv: true,
      };
    } else {
      return {
        oldPrice: undefined,
        price: originalPrice,
        discount: undefined,
        subTotal: originalPrice,
        IGV: 0,
        totalPayment: originalPrice,
        withIgv: false,
      };
    }
  }

  const discountAmount = +(originalPrice * percentageDiscount).toFixed(2);
  const priceAfterDiscount = +(originalPrice - discountAmount).toFixed(2);

  if (withIgv) {
    const subTotal = priceAfterDiscount;
    const IGV = +(subTotal * IGV_RATE).toFixed(2);
    const totalPayment = +(subTotal + IGV).toFixed(2);

    return {
      oldPrice: originalPrice,
      price: priceAfterDiscount,
      discount: discountAmount,
      subTotal,
      IGV,
      totalPayment,
      withIgv: true,
    };
  } else {
    return {
      oldPrice: originalPrice,
      price: priceAfterDiscount,
      discount: discountAmount,
      subTotal: priceAfterDiscount,
      IGV: 0,
      totalPayment: priceAfterDiscount,
      withIgv: false,
    };
  }
};

const getAutoDiscountRate = (product: Product): number => {
  // Productos excluidos de descuento automático
  if (
    product.type &&
    PRODUCTS_WITHOUT_AUTO_DISCOUNT.includes(
      product.type as (typeof PRODUCTS_WITHOUT_AUTO_DISCOUNT)[number],
    )
  ) {
    return 0;
  }

  // Descuento según condición del producto
  return DISCOUNT_RATES[product.condition] ?? 0;
};

const calcProductPricesDetails = (product: Product): Price => {
  const discountRate = getAutoDiscountRate(product);
  return calcProductPrices(product, discountRate);
};

export const products: Product[] = orderBy(
  productsData.map(
    (product) =>
      ({
        ...product,
        ...(product.lumensANSI && {
          throwRatio:
            product.lumensANSI >= 3000
              ? "Proyección media/alta"
              : "Proyección media/estándar",
        }),
        ...calcProductPricesDetails(product),
        campaign: "Tecnología interactiva",
        withIgv: false,
      }) as Product,
  ),
  ["type", "stock"],
  ["desc", "desc"],
);

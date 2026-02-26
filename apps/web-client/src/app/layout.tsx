import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { FooterLayout } from "@/components/ui/layout/FooterLayout";
import { HeaderLayout } from "@/components/ui/layout/HeaderLayout";
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.iubizon.com"),
  title: {
    default:
      "iubizon - Bundle Interactivo y Dúo Interactivo | Soluciones Educativas en Lima, Perú",
    template: "%s",
  },
  description:
    "Transforma tu aula o sala de reuniones con el Bundle Interactivo (Proyector Epson + Touch + MiraCast) y Dúo Interactivo (Touch + MiraCast). Tecnología educativa innovadora en Lima, Perú.",
  alternates: {
    canonical: "https://www.iubizon.com",
  },
  authors: [{ name: "iubizon", url: "https://www.iubizon.com" }],
  creator: "iubizon",
  publisher: "iubizon",
  category: "technology",
  keywords: [
    //Bundle Interactivo
    "bundle interactivo",
    "bundle interactivo perú",
    "bundle interactivo lima",
    "paquete interactivo educativo",
    "solución interactiva para aulas",
    "kit interactivo para colegios",
    "bundle educativo epson",
    "paquete multimedia interactivo",

    //Dúo Interactivo
    "dúo interactivo",
    "touch interactivo",
    "pantalla táctil interactiva",
    "touch portátil",
    "miracast para educación",
    "adaptador inalámbrico miracast",
    "proyección inalámbrica",

    //Educación y tecnología
    "tecnología educativa",
    "tecnología educativa perú",
    "tecnología educativa lima",
    "aulas interactivas",
    "clases interactivas",
    "educación digital",
    "herramientas digitales educación",
    "soluciones educativas innovadoras",
    "transformación digital educativa",
    "tecnología para colegios",
    "tecnología para universidades",
    "equipos interactivos educación",

    //Aplicaciones
    "proyector interactivo",
    "proyector táctil",
    "proyector para aulas",
    "proyector para empresas",
    "presentaciones interactivas",
    "clases dinámicas",
    "colaboración digital",
    "pizarra digital",

    //Marcas y modelos
    "epson powerlite 109w",
    "proyector epson interactivo",
    "touch screen portátil",
    "miracast epson",

    //Ubicación
    "soluciones educativas lima",
    "tecnología educativa san isidro",
    "bundle interactivo miraflores",
    "equipos educativos surco",
    "tecnología para colegios lima",
    "venta de equipos educativos perú",
    "distribuidor tecnología educativa lima",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.iubizon.com",
    title:
      "iubizon - Bundle Interactivo y Dúo Interactivo | Tecnología Educativa",
    description:
      "Transforma tu aula con el Bundle Interactivo y Dúo Interactivo. Soluciones educativas innovadoras con proyector Epson, touch interactivo y Adaptador Inalámbrico WiFi en Lima, Perú.",
    images: [
      {
        url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
      },
    ],
    siteName: "iubizon - Tecnología Educativa Interactiva",
  },
  twitter: {
    card: "summary_large_image",
    title: "iubizon - Bundle Interactivo y Dúo Interactivo",
    description:
      "Transforma tu aula con el Bundle Interactivo y Dúo Interactivo. Tecnología educativa innovadora en Lima, Perú.",
    images: [
      {
        url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
      },
    ],
  },
  facebook: {
    appId: "1176594967865528",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "iubizon",
    description:
      "Empresa líder en soluciones educativas interactivas en Lima, Perú. Especialistas en Bundle Interactivo y Dúo Interactivo para transformar aulas y salas de reuniones con tecnología táctil e inalámbrica.",
    url: "https://www.iubizon.com",
    logo: "https://www.iubizon.com/images/logo.png",
    image: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
    telephone: "+51972300301",
    email: "iubizon.company@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle las acacias, Pje. los Jazmines 181",
      addressLocality: "Chorrillos",
      addressRegion: "Lima",
      postalCode: "15067",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -12.186,
      longitude: -77.014,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "12:00",
      },
    ],
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    sameAs: [
      "https://www.facebook.com/iubizon/",
      "https://www.instagram.com/iubizon",
      "https://www.tiktok.com/@iubizon",
    ],
    areaServed: {
      "@type": "Country",
      name: "Peru",
    },
  };

  return (
    <html lang="es">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
          strategy="beforeInteractive"
        />
        <meta
          name="google-site-verification"
          content="-v1f6esaQNCnNUROmmpub73xH6zZgAp_ue4LcS_oPV8"
        />
      </head>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1158970212368986');
            fbq('track', 'PageView');
          `,
        }}
      />
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-17511349348"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-17511349348');
        `}
      </Script>
      <Script id="google-tag-manager" strategy="afterInteractive">{`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-P8X65GN4');
`}</Script>

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=GT-5D42F39V"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
         window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'GT-5D42F39V');
        `}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P8X65GN4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1158970212368986&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        <HeaderLayout />
        {children}
        <SpeedInsights />
        <Analytics />
        {/* LAYOUT */}
        <FooterLayout />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

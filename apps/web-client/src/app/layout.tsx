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
    default: "iubizon - Compra, Venta y Servicios Tecnológicos en Perú",
    template: "%s | iubizon",
  },
  description:
    "iubizon es la plataforma líder para comprar, vender y ofrecer servicios tecnológicos. Somos importadores directos de tecnología con precios especiales para distribuidores y mayoristas. Encuentra proyectores, accesorios y equipos al mejor precio en Perú.",
  alternates: {
    canonical: "https://www.iubizon.com",
  },
  authors: [{ name: "iubizon", url: "https://www.iubizon.com" }],
  creator: "iubizon",
  publisher: "iubizon",
  category: "technology",
  keywords: [
    "iubizon",
    "compra tecnología",
    "venta tecnología",
    "productos tecnológicos",
    "tienda tecnológica perú",
    "proyectores",
    "accesorios tecnológicos",
    "equipos tecnológicos",
    "tecnología perú",
    "comprar tecnología lima",
    "vender tecnología perú",
    "tienda online tecnología",
    "equipos tecnológicos lima",
    "accesorios epson",
    "proyectores perú",
    "servicios tecnológicos",
    "servicios tech perú",
    "marketplace tecnología",
    "contratar servicios técnicos",
    "reparación equipos",
    "instalación proyectores",
    // Distribuidores y revendedores
    "distribuidor tecnología perú",
    "revendedor tecnología lima",
    "importador tecnología perú",
    "mayorista tecnología",
    "precios mayorista tecnología",
    "ser distribuidor proyectores",
    "revender productos tecnológicos",
    "precios bajos tecnología perú",
    "importadores directos perú",
    "oferta mayorista tecnología",
    "distribución tecnológica perú",
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
    title: "iubizon - Compra, Venta y Servicios Tecnológicos en Perú",
    description:
      "Importadores directos de tecnología con precios especiales para distribuidores y mayoristas. Encuentra proyectores, accesorios y equipos al mejor precio en Perú.",
    images: [
      {
        url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
      },
    ],
    siteName: "iubizon - Plataforma Tecnológica",
  },
  twitter: {
    card: "summary_large_image",
    title: "iubizon - Compra, Venta y Servicios Tecnológicos",
    description:
      "Importadores directos de tecnología con precios especiales para distribuidores y mayoristas en Perú.",
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
    "@type": "OnlineMarketplace",
    name: "iubizon",
    description:
      "Importadores directos de tecnología en Perú. Ofrecemos precios especiales para distribuidores y mayoristas. Proyectores, accesorios y equipos al mejor precio.",
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
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Productos y Servicios",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Productos Tecnológicos",
        },
        {
          "@type": "OfferCatalog",
          name: "Servicios Técnicos",
        },
      ],
    },
    potentialAction: {
      "@type": "BecomeDistributorAction",
      target: "https://www.iubizon.com/contacto",
    },
  };

  return (
    <html lang="es" suppressHydrationWarning>
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

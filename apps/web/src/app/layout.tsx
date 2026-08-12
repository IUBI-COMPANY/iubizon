import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { ClientLayout } from "@/app/providers/ClientLayout";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.iubizon.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      "iubizon | La plataforma para vender productos para educar y trabajar",
    template: "%s | iubizon",
  },
  description:
    "Compra y vende proyectores, pantallas interactivas, laptops, impresoras y servicios tecnológicos en el Perú. Encuentra proveedores verificados para equipar aulas y oficinas con comisiones bajas del 9%.",
  alternates: {
    canonical: baseUrl,
  },
  authors: [{ name: "iubizon", url: baseUrl }],
  creator: "iubizon",
  publisher: "iubizon",
  category: "shopping",
  keywords: [
    "plataforma para educar y trabajar",
    "tecnologia para educacion peru",
    "equipamiento de oficina peru",
    "proyectores para colegios",
    "laptops para trabajar peru",
    "pantallas interactivas peru",
    "equipamiento educativo peru",
    "tecnologia educativa peru",
    "iubizon peru",
    "B2B educacion peru",
    "tecnologia corporativa peru",
    "proveedores de tecnologia peru",
    "vender proyectores peru",
    "pantallas led peru",
    "impresoras corporativas peru",
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
    url: baseUrl,
    title:
      "iubizon | La plataforma para vender productos para educar y trabajar",
    description:
      "Compra y vende proyectores, pantallas interactivas, laptops, impresoras y servicios tecnológicos en el Perú. Encuentra proveedores verificados para equipar aulas y oficinas.",
    images: [
      {
        url: `${baseUrl}/images/banner-seo.png`,
      },
    ],
    siteName: "iubizon - Venta de tecnología para educar y trabajar",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "iubizon | La plataforma para vender productos para educar y trabajar",
    description:
      "Compra y vende proyectores, pantallas interactivas, laptops, impresoras y servicios tecnológicos en el Perú. Encuentra proveedores verificados para equipar aulas y oficinas.",
    images: [`${baseUrl}/images/banner-seo.png`],
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
      "La plataforma líder para comprar y vender productos tecnológicos y servicios para educar y trabajar en el Perú.",
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: `${baseUrl}/images/banner-seo.png`,
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
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
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
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1158970212368986&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

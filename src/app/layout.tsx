import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iubizon - Tu mundo multimedia",
  description:
    "De todo multimedia a precios accesibles para mayoristas y minoristas.",
  openGraph: {
    type: "website",
    url: "https://www.iubizon.com",
    title: "iubizon - Tu mundo multimedia",
    description:
      "De todo multimedia a precios accesibles para mayoristas y minoristas.",
    images: [
      {
        url: "https://storage.googleapis.com/iubi-website.appspot.com/resources/seo-banner.jpg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
        {children}
        <SpeedInsights />
        <Analytics />
        <footer className="pt-10 pb-6 px-4 bg-gradient-to-b from-secondary/100 to-secondary/95">
          <div className="max-w-6xl min-h-[7em] mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Image
                src="/images/logo.png"
                alt="iubizon logo"
                width={100}
                height={36}
                className="w-36 h-auto mb-2 drop-shadow-lg"
              />
            </div>
            <div className="flex flex-col gap-4 text-sm items-center md:items-start">
              <div className="flex items-center gap-2 text-white">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
                </svg>
                <a href="tel:972300301">
                  Teléfono:{" "}
                  <span className="font-semibold ml-1">972300301</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-white">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.09-1.59A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.62.95.97-3.52-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.03-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
                </svg>
                <a href="https://wa.me/+51972300301">
                  WhatsApp:{" "}
                  <span className="font-semibold ml-1">972300301</span>
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center md:items-end">
              <div className="flex gap-4 mt-2">
                <a
                  href="https://www.facebook.com/iubizon/"
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  className="hover:text-[#f25c05]"
                >
                  <Image
                    src="/svg/facebook.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </a>
                <a
                  href="https://www.instagram.com/iubizon"
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="hover:text-[#f25c05]"
                >
                  <Image
                    src="/svg/instagram.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </a>
                <a
                  href="https://www.tiktok.com/@iubizon"
                  target="_blank"
                  rel="noopener"
                  aria-label="TikTok"
                  className="hover:text-[#f25c05]"
                >
                  <Image
                    src="/svg/tiktok.svg"
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[#67798C]">
            © {new Date().getFullYear()} iubizon. Todos los derechos
            reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}

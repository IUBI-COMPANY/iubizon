import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iubizon",
  description:
    "De todo multimedia a precios accesibles para mayoristas y minoristas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
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
                Teléfono: <span className="font-semibold ml-1">972300301</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.09-1.59A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.62.95.97-3.52-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.03-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
                </svg>
                WhatsApp: <span className="font-semibold ml-1">972300301</span>
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
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M17.525 2.273h-3.05c-2.406 0-3.975 1.57-3.975 3.997v2.01H7.273a.273.273 0 0 0-.273.273v3.273c0 .151.122.273.273.273h3.227v8.627c0 .151.122.273.273.273h3.273c.151 0 .273-.122.273-.273v-8.627h2.197c.151 0 .273-.122.273-.273l.001-3.273a.273.273 0 0 0-.273-.273h-2.198v-1.71c0-.82.195-1.236 1.263-1.236h1.935a.273.273 0 0 0 .273-.273V2.546a.273.273 0 0 0-.273-.273z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/iubizon"
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="hover:text-[#f25c05]"
                >
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.345 3.678 1.326c-.98.98-1.195 2.093-1.254 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.281.274 2.394 1.254 3.374.98.98 2.093 1.195 3.374 1.254C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.394-.274 3.374-1.254.98-.98 1.195-2.093 1.254-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.281-.274-2.394-1.254-3.374-.98-.98-2.093-1.195-3.374-1.254C15.668.013 15.259 0 12 0z" />
                    <circle cx="12" cy="12" r="3.5" fill="white" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@iubizon"
                  target="_blank"
                  rel="noopener"
                  aria-label="TikTok"
                  className="hover:text-[#f25c05]"
                >
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm2.5 14.5c-.828 0-1.5-.672-1.5-1.5V8h-2v7c0 2.21 1.79 4 4 4s4-1.79 4-4h-2c0 .828-.672 1.5-1.5 1.5z" />
                  </svg>
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

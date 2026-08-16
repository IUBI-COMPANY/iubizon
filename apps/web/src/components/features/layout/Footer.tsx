import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Landmark,
} from "lucide-react";
import type { Category } from "@/types";

interface FooterProps {
  categories?: Category[];
}

const DEFAULT_CATEGORIES = [
  { name: "Proyectores y Ecrams", slug: "proyectores" },
  { name: "Laptops y Computadoras", slug: "laptops" },
  { name: "Pantallas Interactivas", slug: "pantallas-interactivas" },
  { name: "Celulares y Tablets", slug: "moviles" },
  { name: "Audio y Conferencia", slug: "audio" },
  { name: "Mobiliario Escolar y Oficina", slug: "mobiliario" },
  { name: "Redes y Conectividad", slug: "redes" },
  { name: "Electrónica e Impresión", slug: "electronica" },
  { name: "Accesorios y Periféricos", slug: "accesorios" },
  { name: "Útiles y Suministros", slug: "utiles-suministros" },
  { name: "Otros", slug: "otros" },
];

export const Footer = ({ categories = [] }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const categoryItems =
    categories && categories.length > 0
      ? categories.map((cat) => ({
          label: cat.name,
          href: `/search?category_id=${cat.id}`,
        }))
      : DEFAULT_CATEGORIES.map((cat) => ({
          label: cat.name,
          href: `/search?keywords=${encodeURIComponent(cat.slug)}`,
        }));

  const footerLinks = {
    comprar: [
      { label: "Todas las categorías", href: "/search" },
      ...categoryItems,
    ],
    vender: [{ label: "Publicar producto", href: "/products/new" }],
    ayuda: [
      { label: "¿Qué es IUBIZON?", href: "/about" },
      { label: "Centro de ayuda", href: "/help" },
      { label: "Cómo comprar", href: "/help?tab=comprar" },
      { label: "Cómo vender", href: "/help?tab=vender" },
      { label: "Seguridad", href: "/help?tab=seguridad" },
    ],
    legal: [
      { label: "Términos y condiciones", href: "/help?tab=terminos" },
      { label: "Política de privacidad", href: "/help?tab=privacidad" },
    ],
  };

  return (
    <footer className="bg-[#112237] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex flex-col items-start mb-4">
              <Image
                src="/images/logo.png"
                alt="iubizon"
                width={150}
                height={40}
                className="h-10 w-auto object-contain"
                style={{ width: "auto" }}
              />
              {process.env.NODE_ENV !== "production" && (
                <span className="text-[9px] font-black text-white bg-[#f25c05] px-1.5 py-[1px] rounded tracking-wider leading-none mt-0.5 shadow-sm">
                  DEV
                </span>
              )}
            </Link>
            <p className="text-[#94a3b8] text-sm mb-4">
              Tecnología para educar y trabajar.
            </p>
            <div className="text-xs mb-3 leading-relaxed">
              <p className="font-bold text-slate-200">IUBIZON COMPANY S.A.C.</p>
              <p className="font-semibold text-[#94a3b8] text-[11px] tracking-wide">
                RUC: 20614600374
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/iubizon"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/iubizon"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Comprar</h4>
            <ul className="space-y-2">
              {footerLinks.comprar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94a3b8] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Vender</h4>
            <ul className="space-y-2">
              {footerLinks.vender.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94a3b8] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94a3b8] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <Phone className="w-4 h-4" />
                <span>+51 972 300 301</span>
              </li>
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <Mail className="w-4 h-4" />
                <span>iubizon.company@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <MapPin className="w-4 h-4" />
                <span>Lima, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#94a3b8] text-sm">
              © {currentYear} Iubizon. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#94a3b8] hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

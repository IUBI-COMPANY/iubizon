'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    comprar: [
      { label: 'Todas las categorías', href: '/search' },
      { label: 'Electrónica', href: '/search?keywords=electronica' },
      { label: 'Hogar', href: '/search?keywords=hogar' },
      { label: 'Herramientas', href: '/search?keywords=herramientas' },
    ],
    vender: [
      { label: 'Publicar producto', href: '/products/new' },
      { label: 'Iubizon PRO', href: '/iubizon-pro' },
      { label: 'Consejos para vender', href: '/help/selling-tips' },
    ],
    ayuda: [
      { label: 'Centro de ayuda', href: '/help' },
      { label: 'Cómo comprar', href: '/help/how-to-buy' },
      { label: 'Cómo vender', href: '/help/how-to-sell' },
      { label: 'Seguridad', href: '/help/security' },
    ],
    legal: [
      { label: 'Términos y condiciones', href: '/terms' },
      { label: 'Política de privacidad', href: '/privacy' },
      { label: 'Política deCookies', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-[#112237] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.png"
                alt="iubizon"
                width={150}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-[#94a3b8] text-sm mb-4">
              El marketplace de confianza en Perú. Compra y vende de forma segura.
            </p>
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
                <span>hola@iubizon.com</span>
              </li>
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <MapPin className="w-4 h-4" />
                <span>Lima, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
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
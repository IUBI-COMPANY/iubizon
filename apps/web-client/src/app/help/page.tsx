'use client';

import Link from 'next/link';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, HelpCircle, Shield, Truck, MessageCircle, Package, CreditCard, User } from 'lucide-react';

const helpCategories = [
  {
    icon: HelpCircle,
    title: 'Cómo comprar',
    description: 'Aprende a comprar en Iubizon de forma segura',
    links: [
      { label: '¿Cómo buscar productos?', href: '#' },
      { label: '¿Cómo contactar al vendedor?', href: '#' },
      { label: '¿Cómo realizar el pago?', href: '#' },
      { label: '¿Cómo hacer el seguimiento del envío?', href: '#' },
    ],
  },
  {
    icon: Package,
    title: 'Cómo vender',
    description: 'Publica y vende tus productos fácilmente',
    links: [
      { label: '¿Cómo publicar un producto?', href: '#' },
      { label: 'Consejos para vender más', href: '#' },
      { label: '¿Cómo gestionar mis ventas?', href: '#' },
      { label: '¿Qué son los lotes?', href: '#' },
    ],
  },
  {
    icon: Shield,
    title: 'Seguridad',
    description: 'Mantente seguro al comprar y vender',
    links: [
      { label: 'Consejos de seguridad', href: '#' },
      { label: 'Cómo evitar fraudes', href: '#' },
      { label: 'Políticas de protección', href: '#' },
      { label: '¿Qué hacer si tengo problemas?', href: '#' },
    ],
  },
  {
    icon: Truck,
    title: 'Envíos',
    description: 'Todo sobre envíos y entregas',
    links: [
      { label: '¿Cómo funcionan los envíos?', href: '#' },
      { label: 'Couriers disponibles', href: '#' },
      { label: 'Costos de envío', href: '#' },
      { label: 'Rastrear mi envío', href: '#' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagos',
    description: 'Métodos de pago y facturación',
    links: [
      { label: 'Métodos de pago aceptados', href: '#' },
      { label: '¿Qué es Mercado Pago?', href: '#' },
      { label: '¿Cómo funciona la protección?', href: '#' },
      { label: 'Política de reembolsos', href: '#' },
    ],
  },
  {
    icon: User,
    title: 'Mi cuenta',
    description: 'Gestiona tu perfil y configuraciones',
    links: [
      { label: '¿Cómo cambiar mi contraseña?', href: '#' },
      { label: '¿Cómo actualizar mi perfil?', href: '#' },
      { label: 'Notificaciones', href: '#' },
      { label: 'Iubizon PRO', href: '#' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#112237] mb-4">
              Centro de ayuda
            </h1>
            <p className="text-[#64748b] mb-8">
              Encuentra respuestas a tus preguntas sobre Iubizon
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
              <input
                type="text"
                placeholder="Buscar en la ayuda..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c05] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {helpCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f25c05]/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#f25c05]" />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <p className="text-sm text-[#64748b]">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <a
                            href={link.href}
                            className="text-sm text-[#64748b] hover:text-[#f25c05] transition-colors"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#64748b] mb-4">
              ¿No encuentras lo que buscas?
            </p>
            <a
              href="mailto:soporte@iubizon.com"
              className="text-[#f25c05] font-medium hover:underline"
            >
              Contacta con nuestro soporte
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
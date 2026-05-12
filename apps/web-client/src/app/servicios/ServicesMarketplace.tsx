"use client";

import { useState } from "react";
import { Search, MapPin, Star, Wrench, Laptop, Monitor, Settings, Wifi } from "lucide-react";
import { Button } from "@/components/ui";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  rating: number;
  reviews: number;
  seller: string;
  imageUrl?: string;
}

const categories = [
  { id: "all", name: "Todos", icon: Settings },
  { id: "repair", name: "Reparación", icon: Wrench },
  { id: "installation", name: "Instalación", icon: Monitor },
  { id: "configuration", name: "Configuración", icon: Laptop },
  { id: "networking", name: "Redes", icon: Wifi },
];

const sampleServices: Service[] = [
  {
    id: "1",
    title: "Instalación de Proyectores",
    description:
      "Instalación profesional de proyectores en hogares, oficinas y aulas. Incluye montaje en pared o techo, calibración y configuración básica.",
    category: "installation",
    price: 80,
    location: "Lima",
    rating: 4.8,
    reviews: 24,
    seller: "Carlos Mendoza",
  },
  {
    id: "2",
    title: "Reparación de Laptops y Computadoras",
    description:
      "Servicio técnico especializado en reparación de laptops y computadoras. Diagnóstico gratuito, reemplazo de pantallas, baterías, keyboards y más.",
    category: "repair",
    price: 50,
    location: "Lima",
    rating: 4.9,
    reviews: 56,
    seller: "Juan Pérez",
  },
  {
    id: "3",
    title: "Configuración de Redes WiFi",
    description:
      "Configuración y optimización de redes WiFi para hogares y oficinas. Instalación de routers, mesh systems y soluciones de cobertura.",
    category: "networking",
    price: 60,
    location: "Lima",
    rating: 4.7,
    reviews: 18,
    seller: "María González",
  },
  {
    id: "4",
    title: "Mantenimiento de Proyectores",
    description:
      "Mantenimiento preventivo y correctivo de proyectores. Limpieza de filtros, reemplazo de lámpara y calibración de imagen.",
    category: "repair",
    price: 70,
    location: "Lima",
    rating: 4.6,
    reviews: 12,
    seller: "TechService Peru",
  },
  {
    id: "5",
    title: "Configuración de Sistemas de Audio",
    description:
      "Instalación y configuración de sistemas de audio para presentaciones, cines en casa y eventos.",
    category: "configuration",
    price: 90,
    location: "Lima",
    rating: 4.8,
    reviews: 31,
    seller: "AudioPro",
  },
  {
    id: "6",
    title: "Soporte Técnico Remoto",
    description:
      "Soporte técnico remoto para resolve problemas de software, configuración de equipos y asesoramiento técnico.",
    category: "configuration",
    price: 30,
    location: "Remoto",
    rating: 4.9,
    reviews: 89,
    seller: "SoporteTech",
  },
];

export default function ServicesMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = sampleServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.icon : Settings;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Servicios Tecnológicos
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Encuentra profesionales y servicios técnicos ofrecidos por usuarios.
            Reparación, instalación, configuración y más.
          </p>

          {/* Search */}
          <div className="max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === "all"
              ? "Todos los Servicios"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-gray-600">
            {filteredServices.length} servicios encontrados
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda o categorías
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const Icon = getCategoryIcon(service.category);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">
                          {service.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({service.reviews})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      {service.location}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-amber-600">
                          S/ {service.price}
                        </span>
                        <span className="text-gray-500 text-sm"> desde</span>
                      </div>
                      <Button size="sm">Contactar</Button>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Por: {service.seller}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-amber-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Ofreces servicios tecnológicos?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Únete a iubizon y reacha más clientes. Publica tus servicios y
            comienza a generar ingresos hoy.
          </p>
          <Button size="lg">Publicar mi Servicio</Button>
        </div>
      </section>
    </div>
  );
}
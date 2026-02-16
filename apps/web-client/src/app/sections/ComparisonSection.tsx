"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { COMPARISON_DATA } from "@/data-list/comparisonData";

export const ComparisonSection: React.FC = () => {
  return (
    <section
      id="comparacion"
      className="py-20 px-6 bg-gradient-to-b from-[#060e1e] via-[#0a1428] to-[#060e1e]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            ¿Por qué elegir el Bundle Interactivo?
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            Descubre por qué esta es la mejor solución inteligente para
            transformar tu sala en un espacio interactivo sin las limitaciones
            de las pantallas tradicionales.
          </p>
        </div>

        {/* Tabla de Comparación */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-3xl border-2 border-primary/30 shadow-2xl shadow-primary/20 backdrop-blur-md bg-gradient-to-br from-[#0a1428]/80 via-[#060e1e]/90 to-[#0a1428]/80">
              <table className="min-w-full">
                {/* Header de la tabla */}
                <thead className="bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 md:px-8 py-6 md:py-8 text-left text-sm md:text-base font-bold text-white uppercase tracking-wider w-1/3 border-r border-primary/20"
                    >
                      Característica
                    </th>
                    <th
                      scope="col"
                      className="px-6 md:px-8 py-6 md:py-8 text-center text-sm md:text-base font-bold text-white uppercase tracking-wider bg-primary/40 w-1/3 border-r border-primary/20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-base">Bundle Interactivo</span>

                        <span className="text-2xl md:text-3xl font-extrabold">
                          S/ 4,500
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 md:px-8 py-6 md:py-8 text-center text-sm md:text-base font-bold text-white uppercase tracking-wider w-1/3"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-base">
                          Proyector Interactivo Típico
                        </span>

                        <span className="text-2xl md:text-3xl font-extrabold">
                          S/ 8,000 - 10,000
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Body de la tabla */}
                <tbody className="divide-y divide-primary/20">
                  {COMPARISON_DATA.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-primary/10 transition-all duration-300 group"
                    >
                      <td className="px-6 md:px-8 py-4 md:py-5 text-sm md:text-base font-medium text-white border-r border-primary/10 group-hover:text-primary transition-colors">
                        {row.caracteristica}
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-center bg-primary/5 border-r border-primary/10">
                        {row.paperluxTank ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <Check className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="bg-red-500/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <X className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-center">
                        {row.pantallaInteractivaTipica ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <Check className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="bg-red-500/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <X className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";

interface StatCard {
  number: string;
  label: string;
  description?: string;
  icon?: string;
}

interface StatsGridProps {
  title?: string;
  description?: string;
  stats: StatCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Componente reutilizable para mostrar estadísticas/métricas
 * Grid de cards con números destacados
 */
export default function StatsGrid({
  title = "Nuestros Números Hablan por Nosotros",
  description,
  stats,
  columns = 4,
  className = "",
}: StatsGridProps) {
  const gridClass =
    columns === 2
      ? "lg:grid-cols-2"
      : columns === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center font-sfpro">
          {title}
        </h2>
      )}

      {description && (
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto font-sfpro">
          {description}
        </p>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${gridClass} gap-6 max-w-7xl mx-auto px-4`}
      >
        {stats.map((stat, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-8 text-center hover:border-primary/30 transition-all duration-300 backdrop-blur-sm">
              {stat.icon && <div className="text-5xl mb-4">{stat.icon}</div>}
              <div className="text-5xl font-bold text-primary mb-3 font-sfpro">
                {stat.number}
              </div>
              <div className="text-xl font-semibold text-white mb-2 font-sfpro">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-sm text-gray-400 font-sfpro">
                  {stat.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

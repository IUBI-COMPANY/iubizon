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
  theme?: "light" | "dark";
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
  theme = "dark",
}: StatsGridProps) {
  const gridClass =
    columns === 2
      ? "lg:grid-cols-2"
      : columns === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  const isDark = theme === "dark";
  const titleClass = isDark ? "text-white" : "text-gray-900";
  const descClass = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark
    ? "bg-gradient-to-br from-white/[0.07] to-white/[0.02] border-white/10"
    : "bg-white border-gray-200";
  const cardText = isDark ? "text-white" : "text-gray-900";
  const cardDesc = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={className}>
      {title && (
        <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center font-sfpro ${titleClass}`}>
          {title}
        </h2>
      )}

      {description && (
        <p className={`text-center mb-8 max-w-2xl mx-auto font-sfpro ${descClass}`}>
          {description}
        </p>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${gridClass} gap-6 max-w-7xl mx-auto px-4`}
      >
        {stats.map((stat, idx) => (
          <div key={idx} className="group relative">
            {isDark && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            )}
            <div className={`relative ${cardBg} rounded-3xl p-8 text-center hover:border-primary/30 transition-all duration-300 ${isDark ? "backdrop-blur-sm" : "shadow-lg border"}`}>
              {stat.icon && <div className="text-5xl mb-4">{stat.icon}</div>}
              <div className="text-5xl font-bold text-primary mb-3 font-sfpro">
                {stat.number}
              </div>
              <div className={`text-xl font-semibold mb-2 font-sfpro ${cardText}`}>
                {stat.label}
              </div>
              {stat.description && (
                <div className={`text-sm font-sfpro ${cardDesc}`}>
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

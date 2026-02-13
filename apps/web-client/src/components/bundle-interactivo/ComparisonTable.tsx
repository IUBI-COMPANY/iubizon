import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface ComparisonItem {
  feature: string;
  basic: boolean | string;
  premium: boolean | string;
  enterprise: boolean | string;
}

interface ComparisonTableProps {
  title?: string;
  items: ComparisonItem[];
  plans: {
    basic: { name: string; price: number; description: string };
    premium: { name: string; price: number; description: string };
    enterprise: { name: string; price: number; description: string };
  };
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ title, items, plans }) => {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-primary mx-auto" />
      ) : (
        <X className="w-6 h-6 text-gray-600 mx-auto" />
      );
    }
    return <span className="text-gray-300 text-sm">{value}</span>;
  };

  return (
    <section className="py-24 bg-bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,95,12,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{title}</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_rgba(242,95,12,0.5)]" />
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <table className="min-w-full divide-y divide-white/10">
                {/* Header */}
                <thead>
                  <tr>
                    <th className="px-6 py-8 text-left w-1/4">
                      <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                        Características
                      </span>
                    </th>
                    {Object.entries(plans).map(([key, plan]) => (
                      <th
                        key={key}
                        className={`px-6 py-8 text-center transition-all duration-300 ${
                          hoveredPlan === key ? 'bg-primary/10' : ''
                        }`}
                        onMouseEnter={() => setHoveredPlan(key)}
                        onMouseLeave={() => setHoveredPlan(null)}
                      >
                        <div className="space-y-2">
                          <p className="text-white font-display font-bold text-xl">{plan.name}</p>
                          <p className="text-gray-400 text-xs">{plan.description}</p>
                          <div className="flex items-center justify-center gap-1 mt-3">
                            <span className="text-primary text-3xl font-bold">S/.</span>
                            <span className="text-white text-4xl font-display font-black">
                              {plan.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-white/10">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                        {item.feature}
                      </td>
                      <td
                        className={`px-6 py-5 text-center transition-all duration-300 ${
                          hoveredPlan === 'basic' ? 'bg-primary/10' : ''
                        }`}
                      >
                        {renderValue(item.basic)}
                      </td>
                      <td
                        className={`px-6 py-5 text-center transition-all duration-300 ${
                          hoveredPlan === 'premium' ? 'bg-primary/10' : ''
                        }`}
                      >
                        {renderValue(item.premium)}
                      </td>
                      <td
                        className={`px-6 py-5 text-center transition-all duration-300 ${
                          hoveredPlan === 'enterprise' ? 'bg-primary/10' : ''
                        }`}
                      >
                        {renderValue(item.enterprise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            >
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <h3 className="text-white font-display font-bold text-2xl mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-primary text-2xl font-bold">S/.</span>
                  <span className="text-white text-4xl font-display font-black">
                    {plan.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{item.feature}</span>
                    <div>{renderValue(item[key as keyof typeof item])}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

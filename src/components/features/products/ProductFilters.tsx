"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { PRODUCT_CONDITIONS, COLORS } from "@/lib/config";
import type { SearchFilters, ProductCondition } from "@/types";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  categories?: { id: string; name: string }[];
}

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "popular", label: "Más populares" },
];

export const ProductFilters = ({
  filters,
  onChange,
  categories = [],
}: ProductFiltersProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) =>
      v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-[#112237] mb-3">Ordenar por</h4>
        <Select
          value={filters.sortBy || "newest"}
          onValueChange={(value) => updateFilter("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[#112237] mb-3">Categoría</h4>
          <Select
            value={filters.categoryId || ""}
            onValueChange={(value) =>
              updateFilter("categoryId", value || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-[#112237] mb-3">
          Rango de precio
        </h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) =>
              updateFilter(
                "minPrice",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              updateFilter(
                "maxPrice",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-[#112237] mb-3">Condición</h4>
        <div className="space-y-2">
          {PRODUCT_CONDITIONS.map((condition) => (
            <label
              key={condition.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.condition?.includes(
                  condition.value as ProductCondition,
                )}
                onChange={(e) => {
                  const current = filters.condition || [];
                  const updated = e.target.checked
                    ? [...current, condition.value as ProductCondition]
                    : current.filter((c) => c !== condition.value);
                  updateFilter("condition", updated);
                }}
                className="w-4 h-4 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
              />
              <span className="text-sm text-[#64748b]">{condition.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#112237]">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#f25c05] hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="lg:hidden w-full">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-[#f25c05] text-white text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <FilterContent />
        </DialogContent>
      </Dialog>
    </>
  );
};

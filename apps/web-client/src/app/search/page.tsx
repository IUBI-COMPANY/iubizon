'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, MapPin, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/ui/ProductCard';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { createClient } from '@/lib/supabase/client';
import type { ProductCondition } from '@/types';

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'like_new', label: 'Como nuevo' },
  { value: 'good', label: 'Buen estado' },
  { value: 'fair', label: 'Aceptable' },
];

const sortOptions = [
  { value: 'most_relevance', label: 'Más relevantes' },
  { value: 'most_recent', label: 'Más recientes' },
  { value: 'price_low', label: 'Menor precio' },
  { value: 'price_high', label: 'Mayor precio' },
  { value: 'nearest', label: 'Más cercano' },
];

const distanceOptions = [
  { value: '', label: 'Cualquier distancia' },
  { value: '5', label: 'Hasta 5 km' },
  { value: '10', label: 'Hasta 10 km' },
  { value: '25', label: 'Hasta 25 km' },
  { value: '50', label: 'Hasta 50 km' },
  { value: '100', label: 'Hasta 100 km' },
];

const projectorResolutionOptions = [
  { value: 'svga', label: '800x600 (SVGA)' },
  { value: 'xga', label: '1024x768 (XGA)' },
  { value: 'wxga', label: '1280x800 (WXGA)' },
  { value: 'hd', label: '1280x720 (HD)' },
  { value: 'full_hd', label: '1920x1080 (Full HD)' },
  { value: 'wuxga', label: '1920x1200 (WUXGA)' },
  { value: 'uhd', label: '3840x2160 (4K UHD)' },
];

const projectorLumensOptions = [
  { value: 'under_1000', label: 'Menos de 1000 lúmenes' },
  { value: '1000_2000', label: '1000 - 2000 lúmenes' },
  { value: '2000_3000', label: '2000 - 3000 lúmenes' },
  { value: '3000_4000', label: '3000 - 4000 lúmenes' },
  { value: '4000_5000', label: '4000 - 5000 lúmenes' },
  { value: 'over_5000', label: 'Más de 5000 lúmenes' },
];

const projectorTechnologyOptions = [
  { value: 'lcd', label: 'LCD' },
  { value: 'dlp', label: 'DLP' },
  { value: 'led', label: 'LED' },
  { value: 'laser', label: 'LÁSER' },
  { value: 'lcos', label: 'LCoS' },
];

const projectorBrandOptions = [
  { value: 'epson', label: 'Epson' },
  { value: 'benq', label: 'BenQ' },
  { value: 'viewsonic', label: 'ViewSonic' },
  { value: 'sony', label: 'Sony' },
  { value: 'lg', label: 'LG' },
  { value: 'optoma', label: 'Optoma' },
  { value: 'acer', label: 'Acer' },
  { value: 'panasonic', label: 'Panasonic' },
  { value: 'nec', label: 'NEC' },
  { value: 'other', label: 'Otra' },
];

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const keywords = searchParams.get('keywords') || '';
  const categoryId = searchParams.get('category_id') || '';
  const orderBy = searchParams.get('order_by') || 'most_relevance';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const conditions = searchParams.get('condition')?.split(',').filter(Boolean) || [];
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const maxDistance = searchParams.get('distance') || '';

  const urlCoords = useMemo(() => {
    if (urlLat && urlLng) {
      return { latitude: parseFloat(urlLat), longitude: parseFloat(urlLng) };
    }
    return null;
  }, [urlLat, urlLng]);

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
const [distanceSliderValue, setDistanceSliderValue] = useState(maxDistance || 100);
  
  const [specs, setSpecs] = useState({
    resolution: searchParams.get('resolution')?.split(',').filter(Boolean) || [] as string[],
    lumens: searchParams.get('lumens')?.split(',').filter(Boolean) || [] as string[],
    technology: searchParams.get('technology')?.split(',').filter(Boolean) || [] as string[],
    brand: searchParams.get('brand')?.split(',').filter(Boolean) || [] as string[],
  });
   
  const limit = 20;

  // Create category maps dynamically
  const categorySlugToId = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => { map[cat.slug] = cat.id; });
    return map;
  }, [categories]);

  const effectiveCategoryId = keywords && categorySlugToId[keywords.toLowerCase()] 
    ? categorySlugToId[keywords.toLowerCase()] 
    : categoryId;
  
  const isProjectorCategory = effectiveCategoryId && categories.find(c => c.id === effectiveCategoryId)?.slug === 'proyectores';

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('id, name, slug').order('sort_order', { ascending: true });
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  const categoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => { map[cat.id] = cat.name; });
    return map;
  }, [categories]);

  // Force re-render after params are available
  useEffect(() => {
    setInitialLoad(true);
  }, []);

  // Sync distance slider when URL changes
  useEffect(() => {
    setDistanceSliderValue(maxDistance ? parseInt(maxDistance) : 100);
  }, [maxDistance]);

  const paramsKey = useMemo(() => 
    `${keywords}|${categoryId}|${orderBy}|${minPrice}|${maxPrice}|${conditions.join(',')}|${maxDistance}|${page}`, 
    [keywords, categoryId, orderBy, minPrice, maxPrice, conditions, maxDistance, page]
  );
  
  const lastParamsKey = useRef('');

  useEffect(() => {
    // Wait for initial load
    if (!initialLoad) return;
    
    if (paramsKey === lastParamsKey.current) return;
    lastParamsKey.current = paramsKey;

    let mounted = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        let queryBuilder = supabase
          .from('products')
          .select('*, category:categories(*), seller:profiles(*), images:product_images(*)', {
            count: 'exact',
          });

        if (keywords) {
          const keywordLower = keywords.toLowerCase();
          const categoryIdFromSlug = categorySlugToId[keywordLower];
          
          if (categoryIdFromSlug) {
            queryBuilder = queryBuilder.eq('category_id', categoryIdFromSlug);
          } else {
            queryBuilder = queryBuilder.or(`title.ilike.%${keywordLower}%,description.ilike.%${keywordLower}%`);
          }
        } else if (effectiveCategoryId) {
          queryBuilder = queryBuilder.eq('category_id', effectiveCategoryId);
        }

        if (minPrice) {
          queryBuilder = queryBuilder.gte('price', parseFloat(minPrice));
        }
        if (maxPrice) {
          queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice));
        }

        if (conditions.length > 0) {
          queryBuilder = queryBuilder.in('condition', conditions);
        }

        // Filtros de especificaciones para proyectores
        if (specs.resolution.length > 0) {
          queryBuilder = queryBuilder.or(specs.resolution.map(r => `specifications->resolution.eq.${r}`).join(','));
        }
        if (specs.lumens.length > 0) {
          queryBuilder = queryBuilder.or(specs.lumens.map(l => `specifications->lumens.eq.${l}`).join(','));
        }
        if (specs.technology.length > 0) {
          queryBuilder = queryBuilder.or(specs.technology.map(t => `specifications->technology.eq.${t}`).join(','));
        }
        if (specs.brand.length > 0) {
          queryBuilder = queryBuilder.or(specs.brand.map(b => `specifications->brand.eq.${b}`).join(','));
        }

        const offset = (page - 1) * limit;
        const { data, count } = await queryBuilder.range(offset, offset + limit - 1);

        if (mounted && data) {
          let sortedProducts = [...data];
          
          // Filter by distance
          if (maxDistance && urlCoords) {
            const maxKm = parseFloat(maxDistance);
            sortedProducts = sortedProducts
              .map(p => ({
                ...p,
                distance: p.latitude && p.longitude 
                  ? Math.sqrt(Math.pow(urlCoords.latitude - p.latitude, 2) + Math.pow(urlCoords.longitude - p.longitude, 2)) * 111 // Approx km
                  : null
              }))
              .filter(p => p.distance === null || p.distance <= maxKm);
          }
          
          // Sorting
          if (orderBy === 'nearest' && urlCoords) {
            // Sort products with coordinates first, then by distance
            sortedProducts.sort((a, b) => {
              const aHasCoords = a.latitude && a.longitude;
              const bHasCoords = b.latitude && b.longitude;
              
              if (aHasCoords && !bHasCoords) return -1;
              if (!aHasCoords && bHasCoords) return 1;
              if (!aHasCoords && !bHasCoords) return 0;
              
              const distA = Math.sqrt(Math.pow(urlCoords.latitude - a.latitude, 2) + Math.pow(urlCoords.longitude - a.longitude, 2));
              const distB = Math.sqrt(Math.pow(urlCoords.latitude - b.latitude, 2) + Math.pow(urlCoords.longitude - b.longitude, 2));
              return distA - distB;
            });
          } else if (orderBy === 'most_recent') {
            sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (orderBy === 'price_low') {
            sortedProducts.sort((a, b) => a.price - b.price);
          } else if (orderBy === 'price_high') {
            sortedProducts.sort((a, b) => b.price - a.price);
          } else {
            sortedProducts.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
          }
          
          setProducts(sortedProducts);
          setTotal(count || 0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => { mounted = false; };
  }, [paramsKey, initialLoad]);

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (key === 'category') {
      if (value) params.set('category_id', value);
      else params.delete('category_id');
    } else if (key === 'sort') {
      if (value && value !== 'most_relevance') params.set('order_by', value);
      else params.delete('order_by');
    } else if (key === 'minPrice') {
      if (value) params.set('min_price', value);
      else params.delete('min_price');
    } else if (key === 'maxPrice') {
      if (value) params.set('max_price', value);
      else params.delete('max_price');
    } else if (key === 'distance') {
      if (value) params.set('distance', value);
      else params.delete('distance');
    }
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleConditionToggle = (cond: string) => {
    const params = new URLSearchParams(searchParams);
    const currentConditions = params.get('condition')?.split(',').filter(Boolean) || [];
    
    const newConditions = currentConditions.includes(cond)
      ? currentConditions.filter(c => c !== cond)
      : [...currentConditions, cond];
    
    if (newConditions.length > 0) {
      params.set('condition', newConditions.join(','));
    } else {
      params.delete('condition');
    }
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleSpecToggle = (specType: 'resolution' | 'lumens' | 'technology' | 'brand', value: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(specType)?.split(',').filter(Boolean) || [];
    
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    if (newValues.length > 0) {
      params.set(specType, newValues.join(','));
    } else {
      params.delete(specType);
    }
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push('/search', { scroll: false });
  };

  const activeFiltersCount = [
    categoryId, 
    minPrice || maxPrice, 
    conditions.length > 0, 
    maxDistance,
    specs.resolution.length > 0,
    specs.lumens.length > 0,
    specs.technology.length > 0,
    specs.brand.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CategoryNav />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#e2e8f0] p-4 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#112237]">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <span className="text-xs bg-[#f25c05] text-white px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Categoría - Radio buttons */}
                <div>
                  <h4 className="text-sm font-semibold text-[#334155] mb-3">Categoría</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={categoryId === ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-4 h-4 text-[#f25c05] accent-[#f25c05]"
                      />
                      <span className="text-sm text-[#475569]">Todas</span>
                    </label>
                    {categories.slice(0, 6).map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={categoryId === cat.id}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-4 h-4 text-[#f25c05] accent-[#f25c05]"
                        />
                        <span className="text-sm text-[#475569]">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Precio - Range inputs */}
                <div>
                  <h4 className="text-sm font-semibold text-[#334155] mb-3">Precio</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs">S/</span>
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={minPrice} 
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)} 
                        className="w-full pl-6 pr-2 py-2 text-sm border border-[#e2e8f0] rounded-md focus:ring-2 focus:ring-[#f25c05] focus:border-transparent"
                      />
                    </div>
                    <span className="text-[#94a3b8]">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs">S/</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxPrice} 
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)} 
                        className="w-full pl-6 pr-2 py-2 text-sm border border-[#e2e8f0] rounded-md focus:ring-2 focus:ring-[#f25c05] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Condición - Checkboxes */}
                <div>
                  <h4 className="text-sm font-semibold text-[#334155] mb-3">Condición</h4>
                  <div className="space-y-1">
                    {conditionOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                        <Checkbox 
                          checked={conditions.includes(opt.value)} 
                          onCheckedChange={() => handleConditionToggle(opt.value)}
                          className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                        />
                        <span className="text-sm text-[#475569]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtros específicos para Proyectores */}
                {isProjectorCategory && (
                  <>
                    {/* Resolución */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#334155] mb-3">Resolución</h4>
                      <div className="space-y-1">
                        {projectorResolutionOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                            <Checkbox 
                              checked={specs.resolution.includes(opt.value)} 
                              onCheckedChange={() => handleSpecToggle('resolution', opt.value)}
                              className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                            />
                            <span className="text-sm text-[#475569]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Luminosidad */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#334155] mb-3">Luminosidad (lúmenes)</h4>
                      <div className="space-y-1">
                        {projectorLumensOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                            <Checkbox 
                              checked={specs.lumens.includes(opt.value)} 
                              onCheckedChange={() => handleSpecToggle('lumens', opt.value)}
                              className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                            />
                            <span className="text-sm text-[#475569]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tecnología */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#334155] mb-3">Tecnología</h4>
                      <div className="space-y-1">
                        {projectorTechnologyOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                            <Checkbox 
                              checked={specs.technology.includes(opt.value)} 
                              onCheckedChange={() => handleSpecToggle('technology', opt.value)}
                              className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                            />
                            <span className="text-sm text-[#475569]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Marca */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#334155] mb-3">Marca</h4>
                      <div className="space-y-1">
                        {projectorBrandOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                            <Checkbox 
                              checked={specs.brand.includes(opt.value)} 
                              onCheckedChange={() => handleSpecToggle('brand', opt.value)}
                              className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                            />
                            <span className="text-sm text-[#475569]">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Ordenar por - Radio buttons */}
                <div>
                  <h4 className="text-sm font-semibold text-[#334155] mb-3">Ordenar por</h4>
                  <div className="space-y-1">
                    {sortOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[#f8fafc]">
                        <input
                          type="radio"
                          name="sort"
                          value={opt.value}
                          checked={orderBy === opt.value}
                          onChange={(e) => handleFilterChange('sort', e.target.value)}
                          className="w-4 h-4 text-[#f25c05] accent-[#f25c05]"
                        />
                        <span className="text-sm text-[#475569]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Distancia - Range slider (solo si hay coords) */}
                {urlCoords && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#334155]">Distancia</h4>
                      <span className="text-xs font-medium text-[#f25c05] bg-[#fff7ed] px-2 py-1 rounded">
                        {Number(distanceSliderValue) >= 100 ? 'Sin límite' : `${distanceSliderValue} km`}
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={distanceSliderValue}
                      onChange={(e) => setDistanceSliderValue(parseInt(e.target.value))}
                      onMouseUp={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        handleFilterChange('distance', value >= 100 ? '' : value.toString());
                      }}
                      onTouchEnd={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        handleFilterChange('distance', value >= 100 ? '' : value.toString());
                      }}
                      className="w-full h-2 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#f25c05]"
                    />
                    
                    <div className="flex justify-between text-xs text-[#94a3b8] mt-2">
                      <span>5 km</span>
                      <span>50 km</span>
                      <span>100 km</span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-[#f0fdf4] rounded-md border border-[#86efac]">
                      <div className="flex items-center gap-2 text-xs text-[#166534]">
                        <MapPin className="w-3 h-3" />
                        <span>Tu ubicación detectada</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="w-full mt-6 border-[#f25c05] text-[#f25c05] hover:bg-[#fff7ed]"
                >
                  <X className="w-4 h-4 mr-2" /> 
                  Limpiar {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#112237]">
                  {keywords ? `Resultados para "${keywords}"` : 'Todos los productos'}
                </h1>
                <p className="text-[#64748b]">{total} productos encontrados</p>
              </div>
              {urlCoords && (
                <div className="text-sm text-[#64748b] flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Productos cercanos a ti
                </div>
              )}
            </div>

            {(categoryId || minPrice || maxPrice || conditions.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryId && (
                  <Badge className="bg-[#e2e8f0] text-[#112237]">
                    {categoryIdToName[categoryId] || categoryId}
                    <button onClick={() => handleFilterChange('category', '')} className="ml-1">×</button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge className="bg-[#e2e8f0] text-[#112237]">
                    S/ {minPrice || '0'} - S/ {maxPrice || '∞'}
                    <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }} className="ml-1">×</button>
                  </Badge>
                )}
                {conditions.map((c) => (
                  <Badge key={c} className="bg-[#e2e8f0] text-[#112237]">
                    {conditionOptions.find(o => o.value === c)?.label}
                    <button onClick={() => handleConditionToggle(c)} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                    <span className="flex items-center px-4">Página {page} de {totalPages}</span>
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-[#112237] mb-2">No se encontraron productos</h2>
                <p className="text-[#64748b] mb-4">Intenta con otros términos o filtros</p>
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
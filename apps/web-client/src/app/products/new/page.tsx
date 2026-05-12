'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { getCategoryIcon } from '@/lib/utils/categoryIcons';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Loader2,
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Camera,
  X,
  Check,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  ThumbsUp,
  Wrench,
  MoreHorizontal,
  MapPin,
  Truck,
  PackageCheck,
  Handshake,
  type LucideIcon,
  GripVertical,
  Plus,
  ImagePlus,
  Info,
  Navigation,
  Building2,
} from 'lucide-react';

import type { Category } from '@/types';

const conditionOptions: Record<string, { icon: LucideIcon; label: string; desc: string; color: string }> = {
  new: { icon: Sparkles, label: 'Nuevo', desc: 'Sin uso, en empaque original', color: '#10b981' },
  like_new: { icon: ShieldCheck, label: 'Como nuevo', desc: 'Sin marcas de uso visible', color: '#3b82f6' },
  good: { icon: ThumbsUp, label: 'Buen estado', desc: 'Marcas mínimas de uso', color: '#f59e0b' },
  fair: { icon: Wrench, label: 'Aceptable', desc: 'Marcas visibles, completamente funcional', color: '#ef4444' },
};

const availabilityOptions = [
  { value: 'unique', label: 'Artículo único', desc: 'Solo tienes uno disponible', icon: Package },
  { value: 'available', label: 'Disponible', desc: 'Tienes más de uno disponible', icon: PackageCheck },
];

const deliveryOptions = [
  { value: 'public_meetup', label: 'Encuentro en lugar público', desc: 'Coordinar un punto de encuentro seguro', icon: Handshake },
  { value: 'pickup', label: 'Retiro en puerta', desc: 'El comprador retira en tu dirección', icon: MapPin },
  { value: 'delivery', label: 'Entrega a puerta', desc: 'Llevas el producto hasta el comprador', icon: Truck },
];

const techCategorySlugs = ['electronica', 'laptops', 'proyectores', 'moviles', 'consolas', 'tv-audio', 'accesorios'];

interface UploadedImage {
  id: string;
  url: string;
  position: number;
  file?: File;
  preview?: string;
  uploading?: boolean;
}

function SortableImage({
  image,
  index,
  onRemove,
  isMain,
}: {
  image: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
  isMain: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className={`aspect-square rounded-xl overflow-hidden relative ${
          isMain ? 'ring-2 ring-[#f25c05] ring-offset-2' : 'ring-1 ring-[#e2e8f0]'
        }`}
      >
        {image.preview ? (
          <Image
            src={image.preview}
            alt={`Foto ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : image.url ? (
          <Image
            src={image.url}
            alt={`Foto ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : null}
        {image.uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        {isMain && !image.uploading && (
          <div className="absolute top-2 left-2 bg-[#f25c05] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
            Principal
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
            className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg"
            title="Eliminar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="bg-black/40 backdrop-blur-sm text-white p-1 rounded-md hover:bg-black/60">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
        {!isMain && !image.uploading && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ right: image.uploading ? undefined : '28px' }}>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [deliveryPreferences, setDeliveryPreferences] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleGeolocate = async () => {
    setGeoLoading(true);
    setFieldErrors((prev) => {
      const { location: _, ...rest } = prev;
      return rest;
    });

    if (!navigator.geolocation) {
      setFieldErrors((prev) => ({ ...prev, location: 'Tu navegador no soporta geolocalización.' }));
      setGeoLoading(false);
      return;
    }

    const isSecure = window.isSecureContext;
    if (!isSecure) {
      console.warn('Geolocation may not work on insecure contexts (HTTP). Use HTTPS for production.');
    }

    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        });
      });
    };

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      let locationName = '';
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es&zoom=10`,
          {
            headers: {
              'User-Agent': 'IubizonMarketplace/1.0',
            },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.city_district ||
            data.address?.suburb ||
            data.address?.county ||
            '';
          const state = data.address?.state || data.address?.region || '';
          const country = data.address?.country || '';
          const parts = [city, state, country].filter(Boolean);
          if (parts.length > 0) {
            locationName = parts.join(', ');
          } else if (data.display_name) {
            locationName = data.display_name.split(',').slice(0, 3).join(',').trim();
          }
        }
      } catch {
        // Nominatim failed, use coordinates
      }

      if (!locationName) {
        locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setLocation(locationName);
      setLatitude(latitude);
      setLongitude(longitude);
    } catch (err: any) {
      const code = err?.code;
      const msgs: Record<number, string> = {
        1: 'Permiso denegado. Habilita el acceso a ubicación en tu navegador y vuelve a intentarlo.',
        2: 'No se pudo determinar tu ubicación. Escríbela manualmente.',
        3: 'Tiempo de espera agotado. Intenta de nuevo o escribe tu ubicación.',
      };
      setFieldErrors((prev) => ({
        ...prev,
        location: msgs[code] || 'No se pudo obtener tu ubicación. Escribe tu ubicación manualmente.',
      }));
    } finally {
      setGeoLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      const sb = createClient();
      const { data } = await sb
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setCategories(data as Category[]);
      setCategoriesLoaded(true);
    };
    loadCategories();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 8 - images.length;
    const filesToAdd = Array.from(files).slice(0, remaining);

    const newImages: UploadedImage[] = filesToAdd.map((file, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      url: '',
      position: images.length + idx,
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === imageId);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== imageId);
    });
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.file) {
        if (img.url) uploadedUrls.push(img.url);
        continue;
      }

      setImages((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, uploading: true } : item
        )
      );

      const formData = new FormData();
      formData.append('file', img.file);
      formData.append('product_id', productId);
      formData.append('position', String(i));

      try {
        const response = await fetch('/api/products/images', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.url);
          setImages((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, id: result.image.id, url: result.url, uploading: false } : item
            )
          );
        }
      } catch {
        // Skip failed uploads
      }
    }

    return uploadedUrls;
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Agrega un título para tu producto';
    if (!price || parseFloat(price) <= 0) errors.price = 'Ingresa un precio válido';
    if (!categoryId) errors.category_id = 'Selecciona una categoría';
    if (!condition) errors.condition = 'Selecciona el estado de tu producto';
    if (!availability) errors.availability = 'Selecciona la disponibilidad';
    if (!location.trim()) errors.location = 'Agrega una ubicación';
    if (deliveryPreferences.length === 0) errors.deliveryPreference = 'Selecciona cómo entregarás el producto';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!user) {
      router.push('/auth/login?redirect=/products/new');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          condition,
          category_id: categoryId,
          brand: brand.trim() || null,
          availability_type: availability,
          stock: 1,
          location: location.trim(),
          latitude,
          longitude,
          delivery_preference: deliveryPreferences.join(','),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al crear el producto');
        setLoading(false);
        return;
      }

      if (images.length > 0) {
        await uploadImages(result.product.id);
      }

      router.push(`/products/${result.product.id}`);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#64748b] hover:text-[#112237] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f25c05] to-[#d94d04] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f25c05]/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#112237]">Publicar producto</h1>
              <p className="text-sm text-[#64748b]">Agrega fotos y detalles para vender más rápido</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <Info className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photos - Drag & Drop */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-[#112237]">Fotos</h2>
                <span className="text-xs text-[#94a3b8]">{images.length}/8</span>
              </div>
              <p className="text-xs text-[#64748b] mb-4">
                Arrastra para reordenar. La primera foto será la imagen principal.
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-4 gap-2.5">
                    {images.map((img, index) => (
                      <SortableImage
                        key={img.id}
                        image={img}
                        index={index}
                        onRemove={removeImage}
                        isMain={index === 0}
                      />
                    ))}
                    {images.length < 8 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center cursor-pointer hover:border-[#f25c05] hover:bg-[#f25c05]/5 transition-all duration-200 group">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-[#f8fafc] group-hover:bg-[#f25c05]/10 flex items-center justify-center transition-colors">
                          <ImagePlus className="w-5 h-5 text-[#94a3b8] group-hover:text-[#f25c05] transition-colors" />
                        </div>
                        <span className="text-[10px] text-[#94a3b8] mt-1 group-hover:text-[#f25c05] transition-colors">Agregar</span>
                      </label>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              {images.length === 0 && (
                <p className="text-xs text-[#94a3b8] mt-3 text-center">
                  Los productos con fotos se venden 5x más rápido
                </p>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#112237]">
                  Título <span className="text-[#f25c05]">*</span>
                </Label>
                <Input
                  placeholder="Ej: iPhone 14 Pro Max 256GB"
                  icon={<Tag className="w-4 h-4" />}
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors((prev) => ({ ...prev, title: '' })); }}
                  error={fieldErrors.title}
                  maxLength={100}
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-[#94a3b8]">{title.length}/100</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#112237]">
                  Precio <span className="text-[#f25c05]">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#112237] text-sm font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setFieldErrors((prev) => ({ ...prev, price: '' })); }}
                    error={fieldErrors.price}
                  />
                </div>
                {price && parseFloat(price) > 0 && (
                  <p className="text-sm font-medium text-[#10b981]">{formatPrice(parseFloat(price))}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#112237]">
                  Categoría <span className="text-[#f25c05]">*</span>
                </Label>
                {categoriesLoaded ? (
                  <div className="grid grid-cols-3 gap-2">
                    {categories
                      .filter((cat) => techCategorySlugs.includes(cat.slug))
                      .sort((a, b) => techCategorySlugs.indexOf(a.slug) - techCategorySlugs.indexOf(b.slug))
                      .map((cat) => {
                        const Icon = getCategoryIcon(cat.slug);
                        const isSelected = categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setCategoryId(cat.id); setFieldErrors((prev) => ({ ...prev, category_id: '' })); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-[#f25c05] bg-[#f25c05]/5 shadow-sm'
                                : 'border-[#e2e8f0] hover:border-[#f25c05]/40 hover:bg-[#f8fafc]'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#f25c05]' : 'text-[#64748b]'}`} />
                            <span className={`text-xs font-medium ${isSelected ? 'text-[#f25c05]' : 'text-[#64748b]'}`}>
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    <button
                      type="button"
                      onClick={() => { setCategoryId('other'); setFieldErrors((prev) => ({ ...prev, category_id: '' })); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                        categoryId === 'other'
                          ? 'border-[#f25c05] bg-[#f25c05]/5 shadow-sm'
                          : 'border-[#e2e8f0] hover:border-[#f25c05]/40 hover:bg-[#f8fafc]'
                      }`}
                    >
                      <MoreHorizontal className={`w-5 h-5 ${categoryId === 'other' ? 'text-[#f25c05]' : 'text-[#64748b]'}`} />
                      <span className={`text-xs font-medium ${categoryId === 'other' ? 'text-[#f25c05]' : 'text-[#64748b]'}`}>
                        Otros
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
                  </div>
                )}
                {fieldErrors.category_id && <p className="text-xs text-[#ef4444]">{fieldErrors.category_id}</p>}
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#112237]">
                  Estado <span className="text-[#f25c05]">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(conditionOptions).map(([value, { icon: Icon, label, desc, color }]) => {
                    const isSelected = condition === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setCondition(value); setFieldErrors((prev) => ({ ...prev, condition: '' })); }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-[#f25c05] bg-[#f25c05]/5 shadow-sm'
                            : 'border-[#e2e8f0] hover:border-[#f25c05]/40 hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: isSelected ? `${color}15` : '#f8fafc' }}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ color: isSelected ? color : '#94a3b8' }} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-[#112237]' : 'text-[#64748b]'}`}>
                            {label}
                          </p>
                          <p className="text-[10px] text-[#94a3b8] truncate">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.condition && <p className="text-xs text-[#ef4444]">{fieldErrors.condition}</p>}
              </div>
            </div>

            {/* Brand */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#112237]">
                  Marca
                  <span className="text-[#94a3b8] font-normal ml-1.5">(opcional)</span>
                </Label>
                <Input
                  placeholder="Ej: Apple, Samsung, Sony..."
                  icon={<Building2 className="w-4 h-4" />}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            {/* Description (optional) */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#112237]">
                  Descripción
                  <span className="text-[#94a3b8] font-normal ml-1.5">(opcional)</span>
                </Label>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Describe tu producto: estado, accesorios incluidos, razón de venta..."
                  maxLength={2000}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#112237]">
                  Disponibilidad <span className="text-[#f25c05]">*</span>
                </Label>
                <div className="space-y-2">
                  {availabilityOptions.map((opt) => {
                    const isSelected = availability === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setAvailability(opt.value);
                          setFieldErrors((prev) => ({ ...prev, availability: '' }));
                        }}
                        className={`flex items-center gap-3 w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-[#f25c05] bg-[#f25c05]/5 shadow-sm'
                            : 'border-[#e2e8f0] hover:border-[#f25c05]/40 hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#f25c05]/10' : 'bg-[#f8fafc]'}`}>
                          <opt.icon className={`w-5 h-5 ${isSelected ? 'text-[#f25c05]' : 'text-[#94a3b8]'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-[#112237]' : 'text-[#64748b]'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-[#94a3b8]">{opt.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 rounded-full bg-[#f25c05] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {fieldErrors.availability && <p className="text-xs text-[#ef4444]">{fieldErrors.availability}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#112237]">
                  Ubicación <span className="text-[#f25c05]">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Ej: Lima, Miraflores"
                      icon={<MapPin className="w-4 h-4" />}
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setLatitude(null); setLongitude(null); setFieldErrors((prev) => ({ ...prev, location: '' })); }}
                      error={fieldErrors.location}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    className="h-11 px-3 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] hover:border-[#f25c05]/40 transition-all flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#f25c05] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Usar mi ubicación"
                  >
                    {geoLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{geoLoading ? 'Localizando...' : 'Mi ubicación'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-[#94a3b8]">Los compradores verán tu ubicación general</p>
              </div>
            </div>

            {/* Delivery Preference */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#112237]">
                  Preferencia de entrega <span className="text-[#f25c05]">*</span>
                  <span className="text-[#94a3b8] font-normal ml-1.5 text-xs">Puedes elegir más de una</span>
                </Label>
                <div className="space-y-2">
                  {deliveryOptions.map((opt) => {
                    const isSelected = deliveryPreferences.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setDeliveryPreferences((prev) =>
                            prev.includes(opt.value)
                              ? prev.filter((v) => v !== opt.value)
                              : [...prev, opt.value]
                          );
                          setFieldErrors((prev) => ({ ...prev, deliveryPreference: '' }));
                        }}
                        className={`flex items-center gap-3 w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-[#f25c05] bg-[#f25c05]/5 shadow-sm'
                            : 'border-[#e2e8f0] hover:border-[#f25c05]/40 hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#f25c05]/10' : 'bg-[#f8fafc]'}`}>
                          <opt.icon className={`w-5 h-5 ${isSelected ? 'text-[#f25c05]' : 'text-[#94a3b8]'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-[#112237]' : 'text-[#64748b]'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-[#94a3b8]">{opt.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 rounded-full bg-[#f25c05] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.deliveryPreference && <p className="text-xs text-[#ef4444]">{fieldErrors.deliveryPreference}</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="sticky bottom-0 bg-[#f8fafc] pt-3 pb-4 -mx-4 px-4 border-t border-[#e2e8f0]">
              <div className="flex gap-3 max-w-2xl mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publicando...
                    </span>
                  ) : 'Publicar producto'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
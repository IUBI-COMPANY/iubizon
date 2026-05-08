'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingBag className="w-20 h-20 text-[#e2e8f0] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#112237] mb-2">Tu carrito está vacío</h2>
            <p className="text-[#64748b] mb-6">Agrega productos para continuar</p>
            <Link href="/search">
              <Button className="bg-[#f25c05] hover:bg-[#e55100]">Ver productos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CategoryNav />
      
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#112237]">
              Mi Carrito ({itemCount} productos)
            </h1>
            <Button variant="ghost" onClick={clearCart} className="text-[#ef4444] hover:bg-red-50">
              Vaciar carrito
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white border border-[#e2e8f0] rounded-lg p-4">
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-[#f8fafc] rounded-md overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image 
                        src={item.image_url} 
                        alt={item.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <Link href={`/products/${item.product_id}`}>
                      <h3 className="font-medium text-[#112237] hover:text-[#f25c05] line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-[#112237] mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-[#ef4444] hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-[#f8fafc] rounded-lg p-6 sticky top-24">
                <h3 className="font-bold text-[#112237] mb-4">Resumen del pedido</h3>
                
                <div className="space-y-3 border-b border-[#e2e8f0] pb-4">
                  <div className="flex justify-between text-[#64748b]">
                    <span>Subtotal ({itemCount} productos)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>Envío</span>
                    <span className="text-[#22c55e]">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg text-[#112237] py-4">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Button className="w-full bg-[#f25c05] hover:bg-[#e55100] py-3">
                  Proceder al pago
                </Button>

                <Link href="/search" className="block text-center mt-3 text-[#64748b] hover:text-[#f25c05]">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
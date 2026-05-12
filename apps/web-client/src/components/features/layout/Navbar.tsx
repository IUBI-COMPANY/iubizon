'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, Plus, Menu, MessageCircle, User as UserIcon, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { coordinates } = useGeolocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('keywords', searchQuery.trim());
      params.set('order_by', 'most_relevance');
    } else {
      params.set('order_by', 'nearest');
    }
    
    if (coordinates) {
      params.set('lat', coordinates.latitude.toString());
      params.set('lng', coordinates.longitude.toString());
    }
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="bg-[#112237] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#f25c05] rounded-lg flex items-center justify-center font-bold text-white">
              i
            </div>
            <span className="font-bold text-xl hidden sm:block">iubizon</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pr-10 bg-white border-0 text-gray-900"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              <>
                <Link href="/products/new">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:flex">
                    <Plus className="w-5 h-5 mr-1" />
                    Vender
                  </Button>
                </Link>
                <Link href="/user/dashboard/messages">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-white hover:bg-white/10 px-2 py-1 rounded-lg"
                  >
                    <Avatar src={user.avatar_url} fallback={user.name?.[0] || 'U'} className="w-8 h-8" />
                    <span className="hidden sm:block text-sm">{user.name || 'Usuario'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#e2e8f0] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#e2e8f0]">
                        <p className="font-medium text-[#112237] truncate">{user.name || 'Usuario'}</p>
                        <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        href="/user/dashboard" 
                        className="flex items-center gap-3 px-4 py-2 text-[#475569] hover:bg-[#f8fafc]"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Mi perfil
                      </Link>
                      
                      <Link 
                        href="/user/dashboard/products" 
                        className="flex items-center gap-3 px-4 py-2 text-[#475569] hover:bg-[#f8fafc]"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4" />
                        Mis productos
                      </Link>
                      
                      <Link 
                        href="/user/profile/edit" 
                        className="flex items-center gap-3 px-4 py-2 text-[#475569] hover:bg-[#f8fafc]"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Editar perfil
                      </Link>
                      
                      <Link 
                        href="/user/dashboard/settings" 
                        className="flex items-center gap-3 px-4 py-2 text-[#475569] hover:bg-[#f8fafc]"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>
                      
                      <div className="border-t border-[#e2e8f0] mt-2 pt-2">
                        <button 
                          onClick={async () => {
                            await signOut();
                            setShowUserMenu(false);
                            window.location.href = '/';
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-[#ef4444] hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="secondary" className="bg-[#f25c05] hover:bg-[#e55100] text-white">
                  Iniciar sesión
                </Button>
              </Link>
            )}

            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
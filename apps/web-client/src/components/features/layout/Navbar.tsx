'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Heart, Plus, User, Menu, X, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-[#f25c05] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-xl font-bold text-[#112237] hidden sm:block">
              iubizon
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/user/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Publicar
                  </Button>
                </Link>
                <Link href="/user/dashboard">
                  <div className="flex items-center gap-2 ml-2">
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name || 'Usuario'}
                      size="sm"
                      showProBadge={user.isPro}
                    />
                    <span className="text-sm font-medium text-[#112237] hidden lg:block">
                      {user.name}
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Crear cuenta</Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-lg">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name || 'Usuario'}
                    size="lg"
                    showProBadge={user.isPro}
                  />
                  <div>
                    <p className="font-medium text-[#112237]">{user.name}</p>
                    <p className="text-sm text-[#64748b]">{user.email}</p>
                  </div>
                </div>
                <Link href="/user/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Mi perfil
                  </Button>
                </Link>
                <Link href="/user/dashboard/products" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Mis productos
                  </Button>
                </Link>
                <Link href="/user/dashboard/orders" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Mis pedidos
                  </Button>
                </Link>
                <Link href="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Favoritos
                  </Button>
                </Link>
                <Button variant="destructive" onClick={signOut} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <h2 className="text-lg font-semibold mb-4">Buscar</h2>
          <Input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <Button onClick={handleSearch} className="w-full mt-4">
            Buscar
          </Button>
        </DialogContent>
      </Dialog>
    </header>
  );
};
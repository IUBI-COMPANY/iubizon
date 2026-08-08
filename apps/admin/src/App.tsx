import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "@/app/dashboard";
import ProductsPage from "@/app/dashboard/productos";
import ProductForm from "@/app/dashboard/productos/form.tsx";
import { ProductProvider } from "@/app/dashboard/productos/context.tsx";
import BannersPage from "@/app/dashboard/banners";
import CategoriesPage from "@/app/dashboard/categorias";
import CategoryForm from "@/app/dashboard/categorias/form.tsx";
import { CategoryProvider } from "@/app/dashboard/categorias/context.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <ProductProvider>
          <CategoryProvider>
            <Routes>
              <Route path="/" element={<BaseLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardContent />} />
                <Route path="productos" element={<ProductsPage />} />
                <Route path="productos/nuevo" element={<ProductForm />} />
                <Route path="categorias" element={<CategoriesPage />} />
                <Route path="categorias/nuevo" element={<CategoryForm />} />
                <Route path="banners" element={<BannersPage />} />
              </Route>
            </Routes>
          </CategoryProvider>
        </ProductProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function DashboardContent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración
        </p>
      </div>
    </div>
  );
}

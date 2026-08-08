import { createContext, useContext, useState, type ReactNode } from "react";

// Tipo de producto
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "disponible" | "agotado" | "descontinuado";
  image: string;
}

// Datos ficticios de productos
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Proyector Epson PowerLite 980W",
    sku: "EPSON-980W",
    category: "Proyectores",
    price: 2500,
    stock: 15,
    status: "disponible",
    image: "/productos/980W/1.jpg",
  },
  {
    id: "2",
    name: "Proyector Epson PowerLite 975W",
    sku: "EPSON-975W",
    category: "Proyectores",
    price: 2200,
    stock: 8,
    status: "disponible",
    image: "/productos/975W/1.jpg",
  },
  {
    id: "3",
    name: "Proyector ViewSonic PA503S",
    sku: "VS-PA503S",
    category: "Proyectores",
    price: 1800,
    stock: 0,
    status: "agotado",
    image: "/productos/520/1.jpg",
  },
  {
    id: "4",
    name: "Cable HDMI 3 metros",
    sku: "ACC-HDMI-3M",
    category: "Accesorios",
    price: 45,
    stock: 120,
    status: "disponible",
    image: "/images/powerCable.png",
  },
  {
    id: "5",
    name: "Control Remoto Universal",
    sku: "ACC-REMOTE-001",
    category: "Accesorios",
    price: 35,
    stock: 50,
    status: "disponible",
    image: "/images/remoteControl.png",
  },
  {
    id: "6",
    name: "Proyector Epson L210W",
    sku: "EPSON-L210W",
    category: "Proyectores",
    price: 3200,
    stock: 5,
    status: "disponible",
    image: "/productos/L210W/1.jpg",
  },
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, product: Omit<Product, "id">) => {
    setProducts(products.map((p) => (p.id === id ? { ...product, id } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
}

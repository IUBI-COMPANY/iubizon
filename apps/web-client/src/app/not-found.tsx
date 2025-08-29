import Link from "next/link";
import Image from "next/image";
import { HomeIcon } from "lucide-react";
import React from "react";

export default function NotFound() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="m-auto flex flex-col items-center justify-center">
        <h1 className="text-7xl text-center font-bold">404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que buscas no existe.</p>
        <Image
          src="/images/product-not-found.png"
          width={344}
          height={80}
          alt="producto no encontrado"
        />
        <Link
          href="/apps/web-client/public"
          className="bg-primary py-3 px-10 mx-auto rounded-2xl text-white flex gap-3 cursor-pointer"
        >
          <HomeIcon /> Ir a la página de inicio
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeftCircle } from "lucide-react";

export const NoFoundComponent = () => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="m-auto flex flex-col items-center justify-center">
        <h1 className="text-7xl text-center font-bold">404</h1>
        <Image
          src="/images/product-not-found.png"
          width={344}
          height={80}
          alt="producto no encontrado"
        />
        <button
          onClick={() => router.back()}
          className="bg-primary py-3 px-10 mx-auto rounded-2xl text-white flex gap-3 cursor-pointer"
        >
          <ArrowLeftCircle />
          <span> Regresar</span>
        </button>
      </div>
    </div>
  );
};

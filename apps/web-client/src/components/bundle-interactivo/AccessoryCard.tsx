import React, { useState } from "react";
import { ProductItem } from "@/types/bundleTypes";
import { Image } from "./Image";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

const AccessoryCard: React.FC<ProductItem> = ({
  name,
  category,
  description,
  icon,
  image,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group w-full h-full bg-[#0d1b35] border border-white/10 rounded-xl p-3 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden cursor-pointer"
      >
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#060e1e]">
          <Image
            src={image || ""}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-110"
          />

          {/* Overlay con categoría */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/40 to-transparent" />

          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-primary text-[9px] font-sfpro font-bold uppercase tracking-[0.2em] block mb-0.5">
              {category}
            </span>
            <h3 className="text-white font-sfpro font-bold text-xs leading-tight group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>

          <div className="absolute top-2 right-2 w-7 h-7 rounded-md bg-primary/20 backdrop-blur-xl flex items-center justify-center text-primary border border-primary/20">
            <Icon name={icon} size={16} />
          </div>
        </div>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={name}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Imagen del accesorio */}
          <div className="flex-1 rounded-2xl overflow-hidden bg-[#060e1e] border border-white/10">
            <Image
              src={image || ""}
              alt={name}
              className="w-full h-full object-contain p-8 max-h-96"
            />
          </div>

          {/* Información del accesorio */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-primary text-xs font-sfpro font-bold uppercase tracking-[0.2em] mb-3 block">
              {category}
            </span>
            <h3 className="text-white font-sfpro font-bold text-2xl md:text-3xl mb-4">
              {name}
            </h3>
            <p className="text-gray-300 text-base font-sfpro leading-relaxed mb-6">
              {description}
            </p>

            {/* Icono destacado */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Icon name={icon} size={24} />
              </div>
              <div>
                <p className="text-white font-sfpro font-bold text-sm">
                  Incluido en el bundle
                </p>
                <p className="text-gray-400 font-sfpro text-xs">
                  Listo para usar
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccessoryCard;

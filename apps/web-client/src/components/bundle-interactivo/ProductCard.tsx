import React from "react";
import { ProductItem } from "@/types/bundleTypes";
import { Icon } from "./Icon";

const ProductCard: React.FC<ProductItem> = ({ name, category, icon }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group border-b-4 border-primary/20 hover:border-primary">
      <div className="w-16 h-16 mb-4 bg-orange-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:rotate-6 shadow-inner">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-gray-900 font-bold text-lg mb-1 font-display">
        {name}
      </h3>
      <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
        {category}
      </p>
    </div>
  );
};

export default ProductCard;

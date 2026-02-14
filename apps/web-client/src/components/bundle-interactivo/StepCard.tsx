import React from "react";
import { UsageStep } from "@/types/bundleTypes";
import { Icon } from "./Icon";

const StepCard: React.FC<UsageStep> = ({ step, title, description, icon }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg backdrop-blur-sm transform transition-all duration-500 ease-out hover:translate-y-[-4px] hover:shadow-[0_20px_60px_rgba(242,95,12,0.15)] hover:border-primary/40 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all duration-700 ease-out group-hover:scale-150 group-hover:bg-primary/10"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-primary font-sfpro font-bold text-xs tracking-widest uppercase border border-primary/30 rounded-full px-4 py-1.5 bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
          Paso {step}
        </span>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 ease-out group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
          <Icon name={icon} size={28} />
        </div>
      </div>

      <h3 className="text-white font-sfpro font-bold text-2xl mb-4 transition-colors duration-300 group-hover:text-primary relative z-10">
        {title}
      </h3>
      <p className="text-gray-400 font-sfpro text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-300 relative z-10">
        {description}
      </p>
    </div>
  );
};

export default StepCard;

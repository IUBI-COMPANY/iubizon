import React from 'react';

interface SpecItemProps {
  label: string;
  value: string;
}

const SpecItem: React.FC<SpecItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 group">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(242,95,12,0.8)] flex-shrink-0 transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(242,95,12,1)]"></span>
        <span className="text-gray-400 font-sfpro font-medium text-xs uppercase tracking-wider transition-colors duration-300 group-hover:text-primary group-hover:translate-x-0.5">
          {label}
        </span>
      </div>
      <span className="text-white font-sfpro font-light text-sm leading-relaxed pl-3.5 transition-all duration-300 group-hover:text-gray-100 group-hover:translate-x-1">
        {value}
      </span>
    </div>
  );
};

export default SpecItem;

import React from "react";

const BundleTitle: React.FC = () => {
  return (
    <div className="relative inline-block">
      <h1 className="bundle-title-container">
        {/* Texto "Bundle" en gris grande */}
        <span className="bundle-text">Bundle</span>

        {/* Texto "interactivo" en naranja superpuesto */}
        <span className="interactivo-text">interactivo</span>
      </h1>
    </div>
  );
};

export default BundleTitle;

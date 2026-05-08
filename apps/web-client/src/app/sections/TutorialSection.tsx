import React, { useState } from "react";
import { School, Briefcase } from "lucide-react";
import { Video } from "@/components/ui/Video";
import {
  useScrollAnimation,
  fadeIn,
  fadeInLeft,
  fadeInRight,
} from "@/hooks/useScrollAnimation";

type UserType = "school" | "business";

interface TutorialSectionProps {
  audienceType?: "escuelas" | "empresas";
  setAudienceType?: (type: "escuelas" | "empresas") => void;
}

interface TutorialContent {
  title: string;
  description: string;
  videoUrl: string;
}

const tutorialContent: Record<UserType, TutorialContent> = {
  school: {
    title: "Escuela o Institución",
    description:
      "Ideal para aulas y centros educativos. Fomenta la participación estudiantil con clases interactivas y colaborativas.",
    videoUrl: "/videos/escuela.mp4",
  },
  business: {
    title: "Empresa",
    description:
      "Perfecto para salas de conferencia. Optimiza reuniones con anotaciones en tiempo real y presentaciones dinámicas.",
    videoUrl: "/videos/empresas.mp4",
  },
};

export const TutorialSection: React.FC<TutorialSectionProps> = ({
  setAudienceType,
}) => {
  const [selectedType, setSelectedType] = useState<UserType>("school");
  const currentContent = tutorialContent[selectedType];

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({
    threshold: 0.2,
  });
  const { ref: videoRef, isVisible: videoVisible } = useScrollAnimation({
    threshold: 0.2,
  });
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation({
    threshold: 0.1,
  });

  // Manejador de cambio que actualiza ambos estados si es necesario
  const handleTypeChange = (type: UserType) => {
    setSelectedType(type);
    if (setAudienceType) {
      setAudienceType(type === "school" ? "escuelas" : "empresas");
    }
  };

  return (
    <section className="py-24 bg-bg-deep relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-1/3 h-96 bg-primary/10 blur-[150px] pointer-events-none rounded-full -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título Principal */}
        <div
          ref={titleRef}
          style={fadeIn(titleVisible)}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-sfpro font-bold text-white mb-4">
            ¿Cómo funciona el bundle interactivo?
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_rgba(242,95,12,0.5)] mt-6" />
        </div>

        {/* Container Principal - Video y Selector */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          {/* Selector de Tipo de Usuario - 20% */}
          <div
            ref={cardsRef}
            style={fadeInLeft(cardsVisible)}
            className="w-full lg:w-[20%] flex flex-col"
          >
            {/* Título de la sección de cards */}
            <h3 className="text-white font-sfpro font-bold text-lg mb-4">
              Selecciona tu tipo de uso
            </h3>

            {/* Cards de Selección - Ocupan todo el alto restante */}
            <div className="flex flex-col gap-4 flex-1">
              <button
                onClick={() => handleTypeChange("school")}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-300 text-left group flex flex-col ${
                  selectedType === "school"
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(242,95,12,0.3)]"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      selectedType === "school"
                        ? "bg-primary text-white"
                        : "bg-white/10 text-gray-400 group-hover:text-white"
                    }`}
                  >
                    <School size={22} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <h3
                      className={`font-sfpro font-bold text-lg ${
                        selectedType === "school"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      Escuela
                    </h3>
                    {/* Descripción siempre visible */}
                    <p className="text-gray-400 text-sm font-sfpro leading-relaxed">
                      {tutorialContent.school.description}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeChange("business")}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-300 text-left group flex flex-col ${
                  selectedType === "business"
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(242,95,12,0.3)]"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      selectedType === "business"
                        ? "bg-primary text-white"
                        : "bg-white/10 text-gray-400 group-hover:text-white"
                    }`}
                  >
                    <Briefcase size={22} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <h3
                      className={`font-sfpro font-bold text-lg ${
                        selectedType === "business"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      Empresa
                    </h3>
                    {/* Descripción siempre visible */}
                    <p className="text-gray-400 text-sm font-sfpro leading-relaxed">
                      {tutorialContent.business.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Video Tutorial - 80% */}
          <div
            ref={videoRef}
            style={fadeInRight(videoVisible)}
            className="w-full lg:w-[80%]"
          >
            <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm group hover:border-primary/40 transition-all">
              <div className="aspect-video bg-bg-dark flex items-center justify-center">
                <Video
                  key={currentContent.videoUrl}
                  src={currentContent.videoUrl}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

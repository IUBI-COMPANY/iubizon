import { PiTelevisionSimpleBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { LuCode } from "react-icons/lu";
import { ProjectorIcon } from "lucide-react";

export const TransformSection = () => (
  <section
    id="transform-section"
    className="w-full py-12 px-4 md:px-0 flex flex-col items-center text-white text-center rounded-2xl mb-8 shadow-lg"
  >
    <h1 className="text-3xl md:text-5xl font-bold mb-10">
      Transforma tus espacios
      <br />
      en experiencias interactivas
    </h1>
    <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div className="flex flex-col items-center">
        <PiTelevisionSimpleBold className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Transforma proyectores o TV en Touch
        </span>
      </div>
      <div className="flex flex-col items-center">
        <FaChalkboardTeacher className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Perfecto para salas universitarias y escolares
        </span>
      </div>
      <div className="flex flex-col items-center">
        <LuCode className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Compatible con todas tus plataformas favoritas
        </span>
      </div>
      <div className="flex flex-col items-center">
        <ProjectorIcon className="text-6xl mb-4" size={60} />
        <span className="text-lg font-medium">
          Proyecta sin cables desde cualquier dispositivo
        </span>
      </div>
    </div>
  </section>
);

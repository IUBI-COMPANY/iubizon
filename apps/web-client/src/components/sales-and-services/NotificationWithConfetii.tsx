import React, { RefObject } from "react";
import Image from "next/image";
import Confetti from "react-confetti";
import { CircleCheck } from "lucide-react";

interface Props {
  formRef: RefObject<HTMLDivElement | null>;
  countdown: number;
}

export function NotificationWithConfetii({ formRef, countdown }: Props) {
  return (
    <div className="w-full h-full grid sm:grid-cols-2 place-items-center relative overflow-hidden">
      <Image
        width={1000}
        height={1000}
        src="/images/iubizon-pet.png"
        alt="iubizonpet"
        className="w-full h-auto"
      />
      <div className="grid place-items-center gap-4 relative">
        <CircleCheck className="w-20 h-20 text-green-600" />
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-secondary">
            ¡Solicitud enviada!
          </h2>
          <p className="text-gray-700">
            Nuestro equipo técnico te contactará pronto para coordinar el
            servicio.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-400 rounded-r-lg p-3">
            <p className="text-sm text-blue-900 flex items-center gap-2">
              <span className="text-lg">📧</span>
              <span>
                <strong>Confirmación enviada</strong> a tu correo con todos los
                detalles
              </span>
            </p>
          </div>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 text-center">
              Redirigiendo en{" "}
              <span className="font-bold text-primary">{countdown}</span>{" "}
              segundo{countdown !== 1 ? "s" : ""}...
            </p>
          </div>
          <p className="text-sm text-gray-500 italic">
            Gracias por confiar en nosotros 🛠️
          </p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <Confetti
          width={formRef.current?.offsetWidth || 400}
          height={formRef.current?.offsetHeight || 600}
          recycle={false}
          numberOfPieces={100}
          gravity={0.3}
        />
      </div>
    </div>
  );
}

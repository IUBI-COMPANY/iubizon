import Image from "next/image";
import { Gift } from "lucide-react";

export const GiftCard = () => {
  return (
    <div className="w-full max-w-[27em] h-auto grid grid-cols-[1fr_7em] gap-3 text-center bg-amber-400/60 rounded-2xl items-center p-3">
      <div className="text-secondary rounded-2xl w-full font-bold">
        <span className="flex items-center justify-center gap-2 max-w-[15em] m-[0_auto_.7em_auto] rounded-full bg-white/50 p-[.3em_1em] text-[.8em] backdrop-blur leading-[1em]">
          <Gift className="w-[1.4em] h-auto" /> Regalo por compra
        </span>
        <p className="text-[1.2em] lg:text-[1.4em] leading-[1.2em]">
          Control remoto y cable de poder
        </p>
      </div>
        <div className="grid place-items-center relative">
          <Image
            src={`/images/accesorios.png`}
            width={100}
            height={100}
            alt="control remoto para proyectores y cable de poder"
            className="w-auto h-auto absolute"
          />
      </div>
    </div>
  );
};

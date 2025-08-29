import Image from "next/image";
import { Gift } from 'lucide-react';


export const GiftCard = () => {
    return (
        <div className="w-full grid grid-cols-[1fr_7em] gap-3 text-center bg-amber-400/60 rounded-2xl items-center p-3">
            <div className="text-secondary rounded-2xl w-full font-bold   leading-[1em]">
                <span className="flex items-center justify-center gap-2 max-w-[15em] m-[0_auto_.7em_auto] rounded-full bg-white/50 p-[.1em_1em] text-[.7em] md:text-[.8em] lg:text-[.6em] backdrop-blur">Regalo por compra <Gift /></span>
                <p className="text-[.8em] md:text-[1em] lg:text-[1.2em]">Control remoto y cable de poder</p>
            </div>
            <div className="relative w-full">
                <div className="flex gap-3 relative mt-[-3.5em]">
                    <Image
                        src={`/images/remoteControl.png`}
                        width={100}
                        height={100}
                        alt="Imagen del cable de poder"
                        className="w-full h-auto object-contain  absolute"
                    />
                    <Image
                        src={`/images/powerCable.png`}
                        width={100}
                        height={100}
                        alt="Imagen del cable de poder"
                        className="w-full h-auto object-contain  absolute"
                    />
                </div>
            </div>
        </div>
    );
}
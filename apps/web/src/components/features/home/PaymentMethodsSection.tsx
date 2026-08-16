"use client";

import Image from "next/image";

export function PaymentMethodsSection() {
  const paymentMethods = [
    {
      name: "Visa",
      icon: "/svg/visa.svg",
      width: 68,
      height: 22,
      className: "h-[22px] sm:h-[24px] w-auto",
    },
    {
      name: "Mastercard",
      icon: "/svg/master-card.svg",
      width: 40,
      height: 30,
      className: "h-[28px] sm:h-[30px] w-auto",
    },
    {
      name: "American Express",
      icon: "/svg/american-express.svg",
      width: 28,
      height: 28,
      className: "h-[53px] sm:h-[53px] w-auto",
    },
    {
      name: "Diners Club",
      icon: "/svg/dinners-club.svg",
      width: 45,
      height: 26,
      className: "h-[53px] sm:h-[53px] w-auto",
    },
    {
      name: "Niubiz",
      icon: "/svg/niubiz.svg",
      width: 120,
      height: 44,
      className: "h-[63px] sm:h-[63px] w-auto",
    },
  ];

  return (
    <section className="py-7">
      <div className="container flex flex-col items-center justify-center text-center gap-8 my-9">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2.5">
          <span>Medios de Pago Aceptados</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-9 md:gap-10">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-center h-9 hover:scale-105 transition-transform duration-200 cursor-default"
              title={method.name}
            >
              <Image
                src={method.icon}
                alt={method.name}
                width={method.width}
                height={method.height}
                className={`${method.className} object-contain`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

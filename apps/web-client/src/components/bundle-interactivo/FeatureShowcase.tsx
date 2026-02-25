import React, { useRef, useEffect, useState } from "react";
import { Video } from "@/components/ui/Video";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string;
  video?: string;
}

interface FeatureShowcaseProps {
  features: Feature[];
  title?: string;
  subtitle?: string;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  features,
  title,
  subtitle,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;

      // Calculate scroll progress (0 to 1)
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (sectionHeight + windowHeight)),
      );

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-gradient-to-b from-bg-dark via-bg-deep to-bg-dark overflow-hidden"
    >
      {/* Animated background elements */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] transition-transform duration-1000"
        style={{
          transform: `translateY(${scrollProgress * 200}px) scale(${1 + scrollProgress * 0.3})`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] transition-transform duration-1000"
        style={{
          transform: `translateY(${-scrollProgress * 150}px) scale(${1 + scrollProgress * 0.2})`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-20">
            {subtitle && (
              <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6 leading-tight">
                {title}
              </h2>
            )}
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(242,95,12,0.6)]" />
          </div>
        )}

        {/* Features Grid */}
        <div className="space-y-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 lg:gap-20 items-center`}
              >
                {/* Content */}
                <div
                  className="flex-1 space-y-6"
                  style={{
                    transform: `translateX(${isEven ? -scrollProgress * 30 : scrollProgress * 30}px)`,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-xl rounded-2xl border border-primary/20">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>

                  <h3 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                    {feature.title}
                  </h3>

                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
                    {feature.description}
                  </p>
                </div>

                {/* Media */}
                <div
                  className="flex-1 relative group"
                  style={{
                    transform: `translateX(${isEven ? scrollProgress * 30 : -scrollProgress * 30}px) scale(${
                      1 - scrollProgress * 0.05
                    })`,
                    transition: "all 0.3s ease-out",
                  }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    {feature.video ? (
                      <Video className="w-full h-auto" src={feature.video} />
                    ) : feature.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
                        <Icon className="w-24 h-24 text-primary/40" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Floating accent */}
                  <div className="absolute -z-10 -inset-4 bg-primary/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

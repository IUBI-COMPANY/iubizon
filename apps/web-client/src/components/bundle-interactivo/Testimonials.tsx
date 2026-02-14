import React, { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image?: string;
  quote: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  autoplay?: boolean;
  interval?: number;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  title,
  subtitle,
  autoplay = true,
  interval = 5000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoplay) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, testimonials.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? "fill-primary text-primary" : "text-gray-600"}`}
      />
    ));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-bg-deep to-bg-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {subtitle && (
              <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-6">
                {title}
              </h2>
            )}
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_rgba(242,95,12,0.5)]" />
          </div>
        )}

        {/* Testimonial Carousel */}
        <div className="relative">
          {/* Main testimonial */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === activeIndex
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative">
                  {/* Quote icon */}
                  <div className="absolute top-8 right-8 opacity-10">
                    <Quote className="w-24 h-24 text-primary" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-8 relative z-10">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    {testimonial.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div>
                      <p className="text-white font-display font-bold text-lg">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 ${
                  index === activeIndex
                    ? "w-10 h-2 bg-primary rounded-full"
                    : "w-2 h-2 bg-white/30 rounded-full hover:bg-white/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

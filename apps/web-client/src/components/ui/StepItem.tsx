import React from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { twMerge } from "tailwind-merge";

type Item = {
  step: number;
  label: string;
  classButton: string;
  icon: React.ReactNode;
};

interface Props {
  items: Item[];
  globalStep: number;
  setGlobalStep: (step: number) => void;
}

export const StepItem = ({ items, globalStep, setGlobalStep }: Props) => {
  return (
    <div className="flex justify-center rounded-full px-2 sm:px-0">
      <ol className="w-full max-w-2xl flex justify-center gap-1 rounded-l-full rounded-r-full overflow-hidden">
        {items.map((item, key) => {
          const isComplete = globalStep > item.step;
          const isActive = globalStep === item.step;
          const isFinishedForm = globalStep === 3;
          const isFutureStep = item.step > globalStep;

          return (
            <li key={key} className="flex-1 flex items-center min-w-0">
              <Button
                styleVariant="solid"
                className={twMerge(
                  `w-full bg-white hover:bg-primary/15 ${isActive ? "text-primary" : "text-gray-400"} ${isComplete && "text-white bg-secondary hover:bg-secondary/80"} text-xs sm:text-sm md:text-base px-2 sm:px-4`,
                  item.classButton,
                )}
                onClick={() => setGlobalStep(item.step)}
                disabled={isFutureStep || isFinishedForm}
              >
                <span className="flex items-center gap-1 sm:gap-2 justify-center truncate">
                  <span className="flex-shrink-0">
                    {isComplete ? (
                      <CircleCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="hidden sm:inline truncate">
                    {item.label}
                  </span>
                </span>
              </Button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

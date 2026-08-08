import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

interface AvatarProps extends React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showProBadge?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    { className, src, alt, fallback, size = "md", showProBadge, ...props },
    ref,
  ) => (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src || undefined}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-[#f8fafc] text-[#64748b] font-medium">
          {fallback || alt?.charAt(0).toUpperCase() || "?"}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {showProBadge && (
        <Badge
          variant="pro"
          className="absolute -bottom-1 -right-1 h-5 px-1.5 text-[10px]"
        >
          PRO
        </Badge>
      )}
    </div>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar };

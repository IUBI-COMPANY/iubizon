import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className = "",
  external = false,
  ...props
}) => {
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <a
      href={href}
      className={`cursor-pointer font-sfpro ${className}`}
      {...externalProps}
      {...props}
    >
      {children}
    </a>
  );
};

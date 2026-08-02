import React from "react";

interface Props {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  children: React.ReactNode;
}

export const Form = ({ children, ...props }: Props) => {
  return (
    <form noValidate autoComplete="off" {...props} className="space-y-6">
      {children}
    </form>
  );
};

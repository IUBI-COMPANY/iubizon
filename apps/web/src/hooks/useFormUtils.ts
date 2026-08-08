import { useEffect } from "react";
import { FieldErrors } from "react-hook-form";
import * as yup from "yup";
import { get, isEmpty, isString } from "lodash";

type ObjectType = Record<string, any>;

interface Props<FormData extends ObjectType> {
  errors?: FieldErrors<FormData>;
  schema: yup.AnyObjectSchema;
}

type Tests = { name: string; params: Record<string, unknown> }[];

interface UseFormUtils<FormData extends ObjectType> {
  required: (name: string) => boolean;
  error: (name: string) => boolean;
  errorMessage: (name: string) => string | undefined;
  errorDetail: (name: string) => FieldErrors<FormData>[string];
}

export const useFormUtils = <FormData extends ObjectType>({
  errors,
  schema,
}: Props<FormData>): UseFormUtils<FormData> => {
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollIntoError();
    }
  }, [errors]);

  const scrollIntoError = () => {
    const formItemErrors = document.getElementsByClassName(
      "scroll-error-anchor",
    );

    if (formItemErrors.length) {
      formItemErrors[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const errorDetail: UseFormUtils<FormData>["errorDetail"] = (name: string) =>
    errors && get(errors, name);

  const errorMessage: UseFormUtils<FormData>["errorMessage"] = (name) => {
    const errorObj = errors && get(errors, name);
    const message = errorObj?.message;

    return isString(message) ? message : undefined;
  };

  const error: UseFormUtils<FormData>["error"] = (name) =>
    !!(errors && get(errors, name));

  const required: UseFormUtils<FormData>["required"] = (name) => {
    const describe = schema.describe();

    const describePath: string[] = [];
    name.split(".").forEach((fieldName) => {
      describePath.push("fields");
      describePath.push(fieldName);
    });

    const fieldInfo = get(describe, describePath);

    const testsPath = [...describePath, "tests"];
    let tests: Tests = get(describe, testsPath, []);

    if (tests.length === 0) {
      tests = fieldInfo?.tests || [];
    }

    const hasRequiredTest = tests.some((test) => test.name === "required");

    const isNotOptional = fieldInfo?.optional === false;

    return hasRequiredTest || isNotOptional;
  };

  return { required, error, errorMessage, errorDetail };
};

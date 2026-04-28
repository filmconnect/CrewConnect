"use client";

import { useFormStatus } from "react-dom";
import Button from "./Button";
import type { ComponentProps } from "react";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "loading" | "type">;

export default function SubmitButton(props: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
}

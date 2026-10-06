"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-wait disabled:opacity-70 dark:hover:bg-[#ccc]"
    >
      {pending ? "Looking up…" : "Look up"}
    </button>
  );
}

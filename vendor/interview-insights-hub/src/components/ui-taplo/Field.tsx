import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const base =
  "w-full bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] border border-[var(--hairline)] rounded-[10px] px-3 text-[15px] leading-[1.55] outline-none transition-[border-color] duration-150 ease-out";

export const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Field({ className = "", ...rest }, ref) {
    return <input ref={ref} className={`${base} h-11 ${className}`} {...rest} />;
  },
);

export const FieldArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function FieldArea({ className = "", ...rest }, ref) {
  return <textarea ref={ref} className={`${base} py-3 resize-none ${className}`} {...rest} />;
});

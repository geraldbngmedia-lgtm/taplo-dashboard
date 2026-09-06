import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 h-10 t-button transition-[opacity,background-color,border-color] duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:opacity-90",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--bg)]",
  ghost:
    "bg-transparent text-[var(--ink)] hover:bg-[var(--hairline)]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "secondary", className = "", ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
});

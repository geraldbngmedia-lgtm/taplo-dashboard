import type { ReactNode } from "react";

export function Section({
  heading,
  children,
  className = "",
}: {
  heading?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-16 ${className}`}>
      {heading && <h2 className="t-section mb-4">{heading}</h2>}
      {children}
    </section>
  );
}

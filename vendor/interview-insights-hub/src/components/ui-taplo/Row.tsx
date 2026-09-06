import type { ReactNode } from "react";

/**
 * Hairline-separated row. Uses group-hover to reveal the trailing action.
 * Place multiple <Row> inside a <div> — each row draws its own top hairline
 * so the group reads as a plain list, no cards, no coloured backgrounds.
 */
export function Row({
  children,
  action,
  onClick,
  className = "",
}: {
  children: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-4 border-t border-[var(--hairline)] py-3 text-left last:border-b ${
        onClick ? "hover:bg-[var(--hairline)]/40 cursor-pointer" : ""
      } ${className}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action && (
        <div className="shrink-0 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 focus-within:opacity-100">
          {action}
        </div>
      )}
    </Tag>
  );
}

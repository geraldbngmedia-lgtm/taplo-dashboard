import { cn } from "@/lib/utils";
import type { SourceDef } from "@/lib/integrations-store";
import linkedinIcon from "@/assets/linkedin-icon.png";
import teamtailorIcon from "@/assets/teamtailor-icon.png";

const glyphs: Record<string, { bg: string; label: string }> = {
  greenhouse: { bg: "#1A7F37", label: "G" },
  lever: { bg: "#1D4ED8", label: "Le" },
  workable: { bg: "#0F766E", label: "W" },
  ashby: { bg: "#111827", label: "A" },
  smartrecruiters: { bg: "#0284C7", label: "SR" },
};

const icons: Record<string, string> = {
  linkedin: linkedinIcon,
  teamtailor: teamtailorIcon,
};

export function SourceGlyph({
  source,
  className,
}: {
  source: SourceDef;
  className?: string;
}) {
  const icon = icons[source.id];
  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        aria-hidden
        className={cn("size-5 shrink-0 rounded-[5px] object-cover", className)}
      />
    );
  }

  const glyph = glyphs[source.id] ?? { bg: "#FF7A5C", label: source.name.slice(0, 1) };
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[9px] font-bold leading-none text-white",
        className,
      )}
      style={{ background: glyph.bg }}
    >
      {glyph.label}
    </span>
  );
}

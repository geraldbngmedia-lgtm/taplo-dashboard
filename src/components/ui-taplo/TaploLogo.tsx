import { cn } from "@/lib/utils";
import taploMark from "@/assets/taplo-mark.png";
import taploWordmark from "@/assets/taplo-wordmark.png";

type TaploLogoProps = {
  variant?: "wordmark" | "mark";
  className?: string;
};

export function TaploLogo({ variant = "wordmark", className }: TaploLogoProps) {
  if (variant === "mark") {
    return (
      <img
        src={taploMark}
        alt="Taplo"
        className={cn("h-7 w-7 object-contain", className)}
      />
    );
  }

  return (
    <img
      src={taploWordmark}
      alt="Taplo"
      className={cn("h-7 w-auto max-w-[148px] object-contain object-left", className)}
    />
  );
}

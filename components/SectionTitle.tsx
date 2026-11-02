import RevealText from "@/components/RevealText";

interface SectionTitleProps {
  white: string;
  red: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionTitle({
  white,
  red,
  align = "center",
  className = "",
}: SectionTitleProps) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";

  return (
    <h2
      className={`section-title font-nabla uppercase leading-[0.95] tracking-tight text-4xl md:text-6xl lg:text-7xl ${alignClass} ${className}`}
    >
      <RevealText
        as="span"
        tone="ink"
        stagger={0.06}
        className="text-ink"
      >
        {white}
      </RevealText>{" "}
      <RevealText
        as="span"
        tone="accent"
        stagger={0.06}
        className="text-accent"
      >
        {red}
      </RevealText>
    </h2>
  );
}
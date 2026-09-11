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
      className={`font-getai uppercase leading-[0.95] tracking-tight text-4xl md:text-6xl lg:text-7xl ${alignClass} ${className}`}
    >
      <RevealText
        as="span"
        fromColor="rgba(255,255,255,0.2)"
        toColor="#ffffff"
        stagger={0.06}
        className="text-white"
      >
        {white}
      </RevealText>{" "}
      <RevealText
        as="span"
        fromColor="rgba(248,113,113,0.25)"
        toColor="#ef4444"
        stagger={0.06}
        className="text-accent-bright"
      >
        {red}
      </RevealText>
    </h2>
  );
}
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
      <span className="text-white">{white} </span>
      <span className="text-accent-bright">{red}</span>
    </h2>
  );
}
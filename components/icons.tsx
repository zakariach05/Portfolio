import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

/**
 * Bibliothèque d'icônes inline (ratio SVG 1/1) remplaçant Font Awesome.
 * Style Lucide (stroke, 24x24) — ~350 B chacune, zéro requête CSS/font.
 * Taille pilotée par className (ex: "h-4 w-4").
 */
function SvgIcon({ children, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ChevronRightIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <polyline points="9 6 15 12 9 18" />
  </SvgIcon>
);

export const PaperPlaneIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinejoin="round" />
  </SvgIcon>
);

/** Spinner : arc circulaire + rotation CSS Tailwind "animate-spin". */
export const SpinnerIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </SvgIcon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 11 15 16 9" />
  </SvgIcon>
);

export const TriangleAlertIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </SvgIcon>
);

export const GraduationCapIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </SvgIcon>
);

export const AwardIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
  </SvgIcon>
);

export const GitBranchIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </SvgIcon>
);

export const CodeIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </SvgIcon>
);

export const CubeIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </SvgIcon>
);

export const ShoppingCartIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </SvgIcon>
);

export const PenNibIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="m12 19 7-7 3 3-7 7-3-3z" />
    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <circle cx="11" cy="11" r="2" />
  </SvgIcon>
);

export const RocketIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </SvgIcon>
);

export const ServerIcon = (p: IconProps) => (
  <SvgIcon {...p}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </SvgIcon>
);
import Link from "next/link";

type InternalLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Pour le tracking sémantique, optionnel */
  title?: string;
};

/**
 * <InternalLink> — lien interne du cocon sémantique.
 * Style discret souligné + hover rouge, ancre descriptive obligatoire.
 * Jamais "cliquez ici".
 */
export default function InternalLink({ href, children, title }: InternalLinkProps) {
  return (
    <Link
      href={href}
      title={title}
      className="font-medium text-red-500 underline decoration-red-500/30 underline-offset-4 transition-colors hover:text-red-400 hover:decoration-red-400"
    >
      {children}
    </Link>
  );
}

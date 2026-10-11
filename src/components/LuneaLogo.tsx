import Image from "next/image";
import Link from "next/link";

type LuneaLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { w: 120, h: 48 },
  md: { w: 160, h: 64 },
  lg: { w: 220, h: 88 },
  hero: { w: 320, h: 128 },
};

export function LuneaLogo({
  href = "/",
  size = "md",
  className = "",
}: LuneaLogoProps) {
  const { w, h } = sizes[size];

  const img = (
    <Image
      src="/logo-lunea.png"
      alt="LUNEA — where dreams are born"
      width={w}
      height={h}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ maxHeight: h, width: "auto" }}
      priority={size === "hero" || size === "md"}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="LUNEA — Accueil">
      {img}
    </Link>
  );
}

/** Compact mark for tight spaces (icon crop of full logo). */
export function LuneaMark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label="LUNEA">
      <Image
        src="/logo-lunea.png"
        alt="LUNEA"
        width={140}
        height={56}
        className="h-9 w-auto object-contain object-left sm:h-10"
        priority
      />
    </Link>
  );
}

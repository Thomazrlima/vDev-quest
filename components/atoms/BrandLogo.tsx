import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = { href?: string; className?: string; imageClassName?: string; priority?: boolean; size?: number };

export function BrandLogo({ href, className = "", imageClassName = "", priority = false, size = 512 }: BrandLogoProps) {
  const image = <Image src="/quest-logo-new.png" alt="v(dev) Quest" width={size} height={size} priority={priority} className={`block shrink-0 object-contain object-center [image-rendering:pixelated] ${imageClassName}`} />;
  return href ? <Link href={href} className={`relative inline-flex shrink-0 ${className}`}>{image}</Link> : <span className={`relative inline-flex shrink-0 ${className}`}>{image}</span>;
}

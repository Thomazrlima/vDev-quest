import { Link } from "@tanstack/react-router";

type AppPath = "/ranking" | "/perfil" | "/characters" | "/missions";

type LogoProps = { href?: AppPath; className?: string; imageClassName?: string; priority?: boolean; size?: number };

export function Logo({ href, className = "", imageClassName = "", priority = false, size = 512 }: LogoProps) {
    const image = <img src="/images/logo.png" alt="v(dev) Quest" width={size} height={size} loading={priority ? "eager" : "lazy"} className={`block shrink-0 object-contain object-center [image-rendering:pixelated] ${imageClassName}`} />;
    return href ? (
        <Link to={href} className={`relative inline-flex shrink-0 ${className}`}>
            {image}
        </Link>
    ) : (
        <span className={`relative inline-flex shrink-0 ${className}`}>{image}</span>
    );
}

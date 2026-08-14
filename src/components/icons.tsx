import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...props}>
            {children}
        </svg>
    );
}

export function MailIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M3 5h18v14H3z" />
            <path d="m3 7 9 6 9-6" />
        </IconBase>
    );
}

export function LockIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M5 10h14v11H5z" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
        </IconBase>
    );
}

export function EyeIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
        </IconBase>
    );
}

export function FaceIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="8" />
            <path d="M9 10h.01M15 10h.01M9 15c1.8 1 4.2 1 6 0" />
        </IconBase>
    );
}

export function HairIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M5 13V9a7 7 0 0 1 14 0v4M5 9c2 1 4-2 5-3 1 2 4 3 9 3M7 13v3M17 13v3" />
            <path d="M8 19h8" />
        </IconBase>
    );
}

export function ShirtIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="m8 4 4 3 4-3 5 4-3 5v7H6v-7L3 8l5-4Z" />
            <path d="M9 4v4h6V4" />
        </IconBase>
    );
}

export function PantsIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M6 3h12l-1 18h-4l-1-9-1 9H7L6 3Z" />
            <path d="M6 8h12" />
        </IconBase>
    );
}

export function ShoeIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M5 4h7v8l4 3h3v4H4v-5l1-3V4Z" />
            <path d="M4 19h16" />
        </IconBase>
    );
}

export function AccessoryIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M5 8h14l-2 5H7L5 8ZM8 8V5h8v3M10 13l-2 7M14 13l2 7" />
        </IconBase>
    );
}

export function ShieldIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 2 4 5v6c0 5 3 8 8 11 5-3 8-6 8-11V5l-8-3Z" />
            <path d="m9 12 2 2 4-5" />
        </IconBase>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </IconBase>
    );
}

export function CrownIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="m3 8 4 3 5-7 5 7 4-3-2 10H5L3 8Z" />
            <path d="M5 21h14" />
        </IconBase>
    );
}

export function SparkIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />
        </IconBase>
    );
}

export function ScrollIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M7 5V3h11a3 3 0 0 1 3 3v1H9V5a2 2 0 0 0-4 0v14a2 2 0 0 0 2 2h10" />
            <path d="M9 7v11a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-1H10" />
        </IconBase>
    );
}

export function MissionsNavIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M10 5h12v2H10zm0 4h8v2h-8zm0 4h12v2H10zm0 4h8v2h-8zm-4-6H4V9h2v2ZM4 9H2V7h2v2Zm4 0H6V7h2v2ZM6 7H4V5h2v2Zm-2 6h2v2H4zm0 4h2v2H4zm-2 0v-2h2v2zm4 0v-2h2v2z" />
        </svg>
    );
}

export function RankingNavIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M21 21H3v-2h18v2Zm-2-4H5v-2h14v2ZM5 5h2v2H5v8H3V3h2v2Zm16 10h-2V7h-2V5h2V3h2v12ZM9 9H7V7h2v2Zm8 0h-2V7h2v2Zm-6-2H9V5h2v2Zm4 0h-2V5h2v2Zm-2-2h-2V3h2v2Z" />
        </svg>
    );
}

export function ProfileNavIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M8 20h8v-2h4v2h-2v2H6v-2H4v-2h4v2Zm-4-2H2V6h2v12Zm12 0H8v-2h8v2Zm6 0h-2V6h2v12Zm-8-4h-4v-2h4v2Zm-4-2H8V8h2v4Zm6 0h-2V8h2v4Zm-2-4h-4V6h4v2ZM6 6H4V4h2v2Zm14 0h-2V4h2v2Zm-2-2H6V2h12v2Z" />
        </svg>
    );
}

export function ChevronIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="m9 6 6 6-6 6" />
        </IconBase>
    );
}

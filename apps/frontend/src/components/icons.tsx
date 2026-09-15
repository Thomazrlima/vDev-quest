import { ArrowDown, Calendar, Camera, Check, Clock, Close, FileText, ArrowRight, ArrowUp, Backpack, Briefcase, ChevronRight, ClipboardNote, Crown, DiamondGem, Eye, Grid3x3, Hand, Handbag, Link, Lock, Mail, Notes, Shirt, ScrollVertical, Shield, Smile, Sparkle, SquareAlert, Sunglasses, Trophy, Upload, User } from "pixelarticons/react";
import type { ComponentType, SVGProps } from "react";
import type { EvidenceType } from "@/types/mission";

export type IconProps = SVGProps<SVGSVGElement>;

export const MailIcon = Mail;
export const LockIcon = Lock;
export const EyeIcon = Eye;
export const FaceIcon = Smile;
export const HairIcon = User;
export const ShirtIcon = Shirt;
export const PantsIcon = Briefcase;
export const ShoeIcon = ArrowRight;
export const AccessoryIcon = Handbag;
export const HatIcon = Crown;
export const GlassesIcon = Sunglasses;
export const DressIcon = Handbag;
export const OverallsIcon = Backpack;
export const VestIcon = Shield;
export const SockIcon = ArrowDown;
export const BootIcon = ArrowUp;
export const GloveIcon = Hand;
export const CloakIcon = DiamondGem;
export const ShieldIcon = Shield;
export const GridIcon = Grid3x3;
export const CrownIcon = Crown;
export const SparkIcon = Sparkle;
export const ScrollIcon = ScrollVertical;
export const MissionsNavIcon = ClipboardNote;
export const RankingNavIcon = Trophy;
export const ProfileNavIcon = User;
export const ChevronIcon = ChevronRight;
export const PhotoEvidenceIcon = Camera;
export const PdfEvidenceIcon = FileText;
export const LinkEvidenceIcon = Link;
export const TextEvidenceIcon = Notes;
export const DeadlineIcon = Calendar;
export const PendingIcon = Clock;
export const DoneIcon = Check;
export const UploadIcon = Upload;
export const AlertIcon = SquareAlert;
export const CloseIcon = Close;
export const TrophyIcon = Trophy;

const evidenceIcons: Record<EvidenceType, ComponentType<IconProps>> = {
    "Foto (PNG, JPEG)": PhotoEvidenceIcon,
    PDF: PdfEvidenceIcon,
    Link: LinkEvidenceIcon,
    Texto: TextEvidenceIcon,
};

/** Cada tipo de evidência tem seu símbolo: o card do mural e a tela de envio falam a mesma língua. */
export function EvidenceIcon({ type, ...props }: IconProps & { type: EvidenceType }) {
    const Icon = evidenceIcons[type];
    return <Icon {...props} />;
}

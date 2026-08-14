import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DATE_FORMATS = {
    short: "dd/MM/yyyy HH:mm",
    full: "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
} as const;

type DateInput = string | number | Date;
type DateFormatVariant = keyof typeof DATE_FORMATS;

function toDate(value: DateInput) {
    return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(value: DateInput, formatOrVariant: DateFormatVariant | string = "short") {
    const dateFormat = Object.hasOwn(DATE_FORMATS, formatOrVariant) ? DATE_FORMATS[formatOrVariant as DateFormatVariant] : formatOrVariant;

    return format(toDate(value), dateFormat, { locale: ptBR });
}
